
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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
      setIsSigningUp(false); // Switch back to login view
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-brand-primary mb-4">
          {isSigningUp ? 'Create Account' : 'Welcome to MEP-Dash'}
        </h1>
        <p className="text-center text-neutral-medium mb-6">
          {isSigningUp ? 'Fill in your details to get started.' : 'Please sign in to continue.'}
        </p>
        <form onSubmit={isSigningUp ? handleSignup : handleLogin} className="space-y-4">
          {isSigningUp && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-neutral-medium">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-medium">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
              minLength={6}
            />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>}
          {message && <p className="text-sm text-green-600 bg-green-100 p-2 rounded-md">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSigningUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSigningUp(!isSigningUp);
              setError('');
              setMessage('');
            }}
            className="text-sm text-brand-primary hover:underline"
          >
            {isSigningUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
