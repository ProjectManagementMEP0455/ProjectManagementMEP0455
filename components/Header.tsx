import React from 'react';
import Avatar from './ui/Avatar';
import { Profile } from '../types';
import { supabase } from '../lib/supabaseClient';

interface HeaderProps {
    user: Profile | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div>
        <h1 className="text-xl font-semibold text-neutral-dark">MEP Project Management</h1>
      </div>
      {user && (
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-semibold text-neutral-dark">{user.full_name}</p>
            <p className="text-sm text-neutral-medium">{user.role}</p>
          </div>
          <Avatar profile={user} size="lg" />
          <button 
            onClick={handleLogout} 
            className="ml-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Logout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;