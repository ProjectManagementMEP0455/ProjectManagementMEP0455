
import React, { useState } from 'react';
import SqlSetupPreview from './SqlSetupPreview';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';

interface SetupPageProps {
  onConfigured: () => void;
}

const SetupPage: React.FC<SetupPageProps> = ({ onConfigured }) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [step, setStep] = useState(1);
  const [bucketsChecked, setBucketsChecked] = useState({
    'invoices': false,
    'progress-photos': false,
    'request-attachments': false,
  });

  const handleCheckboxChange = (bucketName: keyof typeof bucketsChecked) => {
    setBucketsChecked(prev => ({ ...prev, [bucketName]: !prev[bucketName] }));
  };

  const allBucketsChecked = Object.values(bucketsChecked).every(val => val === true);

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
      <h1 className="text-2xl font-bold text-center text-primary mb-4">Step 2: Final Configuration</h1>
       <div className="bg-green-500/20 border-l-4 border-green-400 text-green-300 p-4 my-4" role="alert">
        <p className="font-bold">Success!</p>
        <p>Credentials saved. Now for the final setup steps.</p>
      </div>

      <Card className="p-6 my-6 border-yellow-400/50 border-2 bg-yellow-500/10">
          <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-yellow-300 mr-4 flex-shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
              <div>
                  <h3 className="text-xl font-bold text-yellow-200">Critical: Create Storage Buckets</h3>
                  <p className="text-sm text-yellow-300 mt-2">
                      This step is essential. Without it, you will get a <strong>"Bucket not found"</strong> error when trying to upload any file (like invoices or progress photos).
                  </p>
                  <p className="text-sm text-yellow-300 mt-2">
                      In your Supabase project dashboard, go to <strong>Storage</strong> and create the following three buckets. Make sure to mark each one as <strong>public</strong>.
                  </p>
                  <div className="space-y-3 mt-4">
                      {Object.keys(bucketsChecked).map(bucketName => (
                          <label key={bucketName} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-yellow-500/20 transition-colors">
                              <input
                                  type="checkbox"
                                  checked={bucketsChecked[bucketName as keyof typeof bucketsChecked]}
                                  onChange={() => handleCheckboxChange(bucketName as keyof typeof bucketsChecked)}
                                  className="h-5 w-5 rounded bg-input border-border text-primary focus:ring-primary"
                              />
                              <span className="font-mono text-yellow-200">{bucketName}</span>
                          </label>
                      ))}
                  </div>
              </div>
          </div>
      </Card>

      <SqlSetupPreview />
      
      <Button
        onClick={onConfigured}
        className="w-full mt-6"
        variant="primary"
        disabled={!allBucketsChecked}
        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068M15.75 21a9 9 0 10-9.213-9.213" /></svg>}
      >
        I have created the buckets and run the SQL, finish setup!
      </Button>
      {!allBucketsChecked && (
        <p className="text-center text-xs text-muted-foreground mt-2">Please confirm all storage buckets have been created to continue.</p>
      )}
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
