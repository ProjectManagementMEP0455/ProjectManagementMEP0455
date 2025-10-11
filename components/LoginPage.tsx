import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Button from './ui/Button';
import Input from './ui/Input';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) {
      setError(error.message);
    } else if (data.user) {
      setMessage('Sign up successful! Please check your email to verify your account.');
      setIsSigningUp(false);
      setFullName('');
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="p-8 bg-card/50 backdrop-blur-lg border border-border rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">
          {isSigningUp ? 'Create Account' : 'Welcome to MEP-Dash'}
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          {isSigningUp ? 'Fill in your details to get started.' : 'Please sign in to continue.'}
        </p>
        <form onSubmit={isSigningUp ? handleSignup : handleLogin} className="space-y-4">
          {isSigningUp && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
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
          {message && <p className="text-sm text-green-400 bg-green-500/20 p-3 rounded-md">{message}</p>}
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            className="w-full"
          >
            {loading ? 'Processing...' : (isSigningUp ? 'Sign Up' : 'Sign In')}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSigningUp(!isSigningUp);
              setError('');
              setMessage('');
            }}
            className="text-sm text-primary hover:underline"
          >
            {isSigningUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;