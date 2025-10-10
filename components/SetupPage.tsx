import React, { useState } from 'react';
import SqlSetupPreview from './SqlSetupPreview';

const demoUsers = [
  { email: 'admin@mep-dash.com', password: 'password123', fullName: 'Sam Admin' },
  { email: 'director@mep-dash.com', password: 'password123', fullName: 'Alex Director' },
  { email: 'manager@mep-dash.com', password: 'password123', fullName: 'Brianna Manager' },
  { email: 'engineer@mep-dash.com', password: 'password123', fullName: 'Charlie Engineer' },
];

interface SetupPageProps {
  onConfigured: () => void;
}

const SetupPage: React.FC<SetupPageProps> = ({ onConfigured }) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [step, setStep] = useState(1); // 1: credentials, 2: create users, 3: run sql
  const [isCreatingUsers, setIsCreatingUsers] = useState(false);
  const [creationLog, setCreationLog] = useState<string[]>([]);
  const [creationError, setCreationError] = useState('');

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseUrl && supabaseAnonKey) {
      localStorage.setItem('supabaseUrl', supabaseUrl);
      localStorage.setItem('supabaseAnonKey', supabaseAnonKey);
      setStep(2);
    } else {
      alert('Please provide both Supabase URL and Anon Key.');
    }
  };

  const handleCreateDemoUsers = async () => {
    setIsCreatingUsers(true);
    setCreationLog([]);
    setCreationError('');

    // Dynamically import createClient to create a temporary client with the new credentials
    const { createClient } = await import('@supabase/supabase-js');
    const tempSupabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
      for (const user of demoUsers) {
        // Must sign out before each attempt in case a session from a previous run persists.
        await tempSupabase.auth.signOut();
        
        const { error } = await tempSupabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              full_name: user.fullName,
              avatar_url: `https://i.pravatar.cc/150?u=${user.email}`
            }
          }
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            const message = `User ${user.email} already exists. Skipping.`;
            setCreationLog(prev => [...prev, message]);
          } else {
            throw error;
          }
        } else {
          const message = `Successfully created user: ${user.email}`;
          setCreationLog(prev => [...prev, message]);
        }
      }
      
      await tempSupabase.auth.signOut();
      setCreationLog(prev => [...prev, "\nAll demo users created or verified successfully!"]);
      setStep(3);

    } catch (error: any) {
      const errorMessage = `An error occurred: ${error.message}. Please ensure email confirmation is disabled in your Supabase project's Auth settings and try again.`;
      setCreationError(errorMessage);
    } finally {
      setIsCreatingUsers(false);
    }
  };
  
  const renderStep1 = () => (
    <>
      <h1 className="text-2xl font-bold text-center text-brand-primary mb-4">Step 1: Configure Supabase</h1>
      <p className="text-center text-neutral-medium mb-6">
        Please enter your Supabase project credentials to get started.
      </p>
      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        <div>
            <label htmlFor="supabaseUrl" className="block text-sm font-medium text-neutral-medium">
              Supabase URL
            </label>
            <input
              id="supabaseUrl"
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              placeholder="https://your-project-ref.supabase.co"
              required
            />
          </div>
          <div>
            <label htmlFor="supabaseAnonKey" className="block text-sm font-medium text-neutral-medium">
              Supabase Anon (Public) Key
            </label>
            <input
              id="supabaseAnonKey"
              type="text"
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              placeholder="ey..."
              required
            />
          </div>
        <button
          type="submit"
          className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors"
        >
          Save and Continue
        </button>
      </form>
    </>
  );
  
  const renderStep2 = () => (
    <>
      <h1 className="text-2xl font-bold text-center text-brand-primary mb-4">Step 2: Create Demo Users</h1>
      <p className="text-center text-neutral-medium mb-6">
        Next, we need to create the four demo user accounts in your Supabase project.
      </p>
      <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-4" role="alert">
        <p className="font-bold">Important Prerequisite</p>
        <p>Before proceeding, please go to your Supabase project's dashboard, navigate to <strong>Authentication &gt; Providers &gt; Email</strong>, and turn <strong>OFF</strong> the "Confirm email" toggle. This is required for the automatic user creation to succeed.</p>
      </div>
      <button
        onClick={handleCreateDemoUsers}
        disabled={isCreatingUsers}
        className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
      >
        {isCreatingUsers ? 'Creating Users...' : 'Create Demo Users'}
      </button>
      {(creationLog.length > 0 || creationError) && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md max-h-40 overflow-y-auto">
          <h4 className="font-semibold text-sm mb-2">Log:</h4>
          {creationLog.map((log, i) => <p key={i} className="text-xs text-neutral-medium whitespace-pre-wrap">{log}</p>)}
          {creationError && <p className="text-xs text-red-600 font-semibold">{creationError}</p>}
        </div>
      )}
    </>
  );

  const renderStep3 = () => (
    <>
      <h1 className="text-2xl font-bold text-center text-brand-primary mb-4">Step 3: Setup Database Schema</h1>
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 my-4" role="alert">
        <p className="font-bold">Success!</p>
        <p>The demo users have been created. The final step is to set up your database tables and sample data by running the provided SQL script.</p>
      </div>
      <SqlSetupPreview />
      <button
        onClick={onConfigured}
        className="w-full mt-6 bg-status-green text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
      >
        I have run the SQL script, finish setup!
      </button>
    </>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-2xl">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default SetupPage;
