import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Button from './ui/Button';
import Input from './ui/Input';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="p-8 bg-card/50 backdrop-blur-lg border border-border rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">
          Welcome to MEP-Dash
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Please sign in to continue.
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && <p className="text-sm text-red-400 bg-red-500/20 p-3 rounded-md">{error}</p>}
          
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full"
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
         <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Only an administrator can create new user accounts.</p>
            <p>The first user to sign up after setup is the default administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
