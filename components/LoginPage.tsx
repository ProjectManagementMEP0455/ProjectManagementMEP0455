import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Button from './ui/Button';
import Input from './ui/Input';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  
  const [isInitialSetup, setIsInitialSetup] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  useEffect(() => {
    const checkInitialSetup = async () => {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        
        if (count === 0) {
          setIsInitialSetup(true);
        }
      } catch (err) {
        console.error("Error checking for initial setup:", err);
        setError("Could not connect to the database to check setup status. Please verify your Supabase credentials.");
      } finally {
        setCheckingSetup(false);
      }
    };
    checkInitialSetup();
  }, []);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAuthMessage('');

    if (isInitialSetup) { // Always sign up for initial setup
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setLoading(false);
        return;
      }
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setAuthMessage("Admin account creation initiated! Please check your email to confirm your account. This page will reload once you sign in.");
      }
    } else { // Always sign in for subsequent uses
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
      }
    }
    setLoading(false);
  };

  if (checkingSetup) {
     return <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="p-8 bg-card/50 backdrop-blur-lg border border-border rounded-lg shadow-2xl w-full max-w-md">
        {isInitialSetup ? (
          <>
            <h1 className="text-3xl font-bold text-center text-primary mb-2">Welcome, Administrator!</h1>
            <p className="text-center text-muted-foreground mb-8">Create the first admin account to begin.</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-center text-primary mb-2">Welcome to MEP-Dash</h1>
            <p className="text-center text-muted-foreground mb-8">Please sign in to continue.</p>
          </>
        )}

        <form onSubmit={handleAuthAction} className="space-y-4">
          {isInitialSetup && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-muted-foreground">Full Name</label>
              <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email Address</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">Password</label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          {error && <p className="text-sm text-red-400 bg-red-500/20 p-3 rounded-md text-center">{error}</p>}
          {authMessage && <p className="text-sm text-green-400 bg-green-500/20 p-3 rounded-md text-center">{authMessage}</p>}
          
          <Button type="submit" disabled={loading || !!authMessage} variant="primary" className="w-full" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
            {loading ? (isInitialSetup ? 'Creating Account...' : 'Signing In...') : (isInitialSetup ? 'Create Admin Account' : 'Sign In')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;