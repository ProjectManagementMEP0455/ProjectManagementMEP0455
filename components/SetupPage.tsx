
import React, { useState } from 'react';
import SqlSetupPreview from './SqlSetupPreview'; // Import the new component

interface SetupPageProps {
  onConfigured: () => void;
}

const SetupPage: React.FC<SetupPageProps> = ({ onConfigured }) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [showSql, setShowSql] = useState(false); // Add state for toggling SQL preview

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (supabaseUrl && supabaseAnonKey) {
      localStorage.setItem('supabaseUrl', supabaseUrl);
      localStorage.setItem('supabaseAnonKey', supabaseAnonKey);
      onConfigured();
    } else {
      alert('Please provide both Supabase URL and Anon Key.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center text-brand-primary mb-4">Setup Supabase</h1>
        <p className="text-center text-neutral-medium mb-6">
          Please enter your Supabase project credentials to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
        
        <div className="text-center mt-6">
          <button 
            onClick={() => setShowSql(!showSql)}
            className="text-sm text-brand-primary hover:underline"
          >
            {showSql ? 'Hide' : 'Show'} SQL Setup for Database
          </button>
        </div>

        {showSql && <SqlSetupPreview />}

      </div>
    </div>
  );
};

export default SetupPage;