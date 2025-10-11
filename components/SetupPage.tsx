import React, { useState } from 'react';
import SqlSetupPreview from './SqlSetupPreview';

interface SetupPageProps {
  onConfigured: () => void;
}

const SetupPage: React.FC<SetupPageProps> = ({ onConfigured }) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [step, setStep] = useState(1); // 1: credentials, 2: run sql

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseUrl && supabaseAnonKey) {
      localStorage.setItem('supabaseUrl', supabaseUrl);
      localStorage.setItem('supabaseAnonKey', supabaseAnonKey);
      setStep(2); // Proceed directly to SQL setup
    } else {
      alert('Please provide both Supabase URL and Anon Key.');
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
      <h1 className="text-2xl font-bold text-center text-brand-primary mb-4">Step 2: Setup Database Schema</h1>
       <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 my-4" role="alert">
        <p className="font-bold">Success!</p>
        <p>Credentials saved. The final step is to set up your database tables and automated functions by running the provided SQL script.</p>
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
      </div>
    </div>
  );
};

export default SetupPage;
