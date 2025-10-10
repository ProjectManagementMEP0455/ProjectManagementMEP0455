import React from 'react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-brand-primary mb-2">MEP-Dash</h1>
        <p className="text-center text-neutral-medium mb-8">Project Management for MEP Engineers</p>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-neutral-medium" htmlFor="email">Email</label>
            <input 
                id="email" 
                type="email" 
                defaultValue="alice@mep-dash.com" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary" 
                readOnly
            />
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-medium" htmlFor="password">Password</label>
            <input 
                id="password" 
                type="password" 
                defaultValue="password" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary" 
                readOnly
            />
          </div>
          <button
            onClick={onLogin}
            className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
