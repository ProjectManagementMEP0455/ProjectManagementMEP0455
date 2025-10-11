import React, { useState } from 'react';
import SqlSetupPreview from './SqlSetupPreview';
import Button from './ui/Button';
import Input from './ui/Input';

interface SetupPageProps {
  onConfigured: () => void;
}

const SetupPage: React.FC<SetupPageProps> = ({ onConfigured }) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [step, setStep] = useState(1);

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

  const renderStep1 = () => (
    <>
      <h1 className="text-2xl font-bold text-center text-primary mb-4">Step 1: Configure Supabase</h1>
      <p className="text-center text-muted-foreground mb-6">
        Please enter your Supabase project credentials to get started.
      </p>
      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
        <div>
            <label htmlFor="supabaseUrl" className="block text-sm font-medium text-muted-foreground">
              Supabase URL
            </label>
            <Input
              id="supabaseUrl"
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project-ref.supabase.co"
              required
            />
          </div>
          <div>
            <label htmlFor="supabaseAnonKey" className="block text-sm font-medium text-muted-foreground">
              Supabase Anon (Public) Key
            </label>
            <Input
              id="supabaseAnonKey"
              type="text"
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="ey..."
              required
            />
          </div>
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>}
        >
          Save and Continue
        </Button>
      </form>
    </>
  );

  const renderStep2 = () => (
    <>
      <h1 className="text-2xl font-bold text-center text-primary mb-4">Step 2: Setup Database Schema</h1>
       <div className="bg-green-500/20 border-l-4 border-green-400 text-green-300 p-4 my-4" role="alert">
        <p className="font-bold">Success!</p>
        <p>Credentials saved. The final step is to set up your database by running the provided SQL script.</p>
      </div>
      <SqlSetupPreview />
      <Button
        onClick={onConfigured}
        className="w-full mt-6"
        variant="primary"
        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068M15.75 21a9 9 0 10-9.213-9.213" /></svg>}
      >
        I have run the SQL script, finish setup!
      </Button>
    </>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="p-8 bg-card/50 backdrop-blur-lg border border-border rounded-lg shadow-2xl w-full max-w-2xl">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </div>
    </div>
  );
};

export default SetupPage;