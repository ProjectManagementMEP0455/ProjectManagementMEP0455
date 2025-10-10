import React, { useState } from 'react';

interface SetupPageProps {
  onConfigured: () => void;
}

const SetupPage: React.FC<SetupPageProps> = ({ onConfigured }) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setError('Both Supabase URL and Anon Key are required.');
      return;
    }
    // Basic validation
    if (!supabaseUrl.startsWith('http')) {
        setError('Please enter a valid Supabase URL.');
        return;
    }

    localStorage.setItem('supabaseUrl', supabaseUrl);
    localStorage.setItem('supabaseAnonKey', supabaseAnonKey);
    setError('');
    onConfigured();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-brand-primary mb-2">MEP-Dash Setup</h1>
        <p className="text-center text-neutral-medium mb-6">
          Please provide your Supabase project credentials to connect to your database.
        </p>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center text-sm">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-medium" htmlFor="supabaseUrl">
              Supabase Project URL
            </label>
            <input
              id="supabaseUrl"
              type="text"
              placeholder="https://your-project-ref.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-medium" htmlFor="supabaseAnonKey">
              Supabase Anon (public) Key
            </label>
            <input
              id="supabaseAnonKey"
              type="text"
              placeholder="eyJhbGciOiJIUz..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors"
          >
            Save and Continue
          </button>
        </div>

         <div className="mt-6 text-xs text-neutral-medium text-center">
            You can find these credentials in your Supabase project's API settings. Your credentials will be stored locally in your browser.
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
