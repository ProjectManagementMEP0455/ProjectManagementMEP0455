
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const demoUsers = [
  { role: 'Admin', email: 'admin@mep-dash.com', password: 'password123' },
  { role: 'Project Director', email: 'director@mep-dash.com', password: 'password123' },
  { role: 'Project Manager', email: 'manager@mep-dash.com', password: 'password123' },
  { role: 'Site Engineer', email: 'engineer@mep-dash.com', password: 'password123' },
];

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleDemoLogin = (user: typeof demoUsers[0]) => {
    setEmail(user.email);
    setPassword(user.password);
  };

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              avatar_url: `https://i.pravatar.cc/150?u=${email}` // Default avatar
            }
          }
        });
        if (error) throw error;
        setMessage('Check your email for the login link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-brand-primary mb-2">MEP-Dash</h1>
        <p className="text-center text-neutral-medium mb-6">Project Management for MEP Engineers</p>
        
        <div className="flex border-b mb-6">
          <button onClick={() => {setIsSignUp(false); setError(null);}} className={`w-1/2 py-2 font-semibold ${!isSignUp ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-neutral-medium'}`}>
            Sign In
          </button>
          <button onClick={() => {setIsSignUp(true); setError(null);}} className={`w-1/2 py-2 font-semibold ${isSignUp ? 'border-b-2 border-brand-primary text-brand-primary' : 'text-neutral-medium'}`}>
            Sign Up
          </button>
        </div>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center text-sm">{error}</p>}
        {message && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-center text-sm">{message}</p>}

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-sm font-medium text-neutral-medium" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-neutral-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-medium" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-center text-sm font-semibold text-neutral-medium mb-3">
            Quick Demo Logins
          </h3>
          <div className="space-y-2">
            {demoUsers.map((user) => (
              <button
                key={user.email}
                onClick={() => handleDemoLogin(user)}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                aria-label={`Login as ${user.role}`}
              >
                Login as {user.role}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;