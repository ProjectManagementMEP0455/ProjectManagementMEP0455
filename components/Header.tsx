import React from 'react';
import { MOCK_USERS } from '../constants';
import Avatar from './ui/Avatar';

interface HeaderProps {
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const currentUser = MOCK_USERS[0]; // Assuming Alice is the logged-in user

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div>
        {/* Can add search or other controls here */}
        <h1 className="text-xl font-semibold text-neutral-dark">MEP Project Management</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="font-semibold text-neutral-dark">{currentUser.name}</p>
          <p className="text-sm text-neutral-medium">{currentUser.role}</p>
        </div>
        <Avatar user={currentUser} size="lg" />
        <button 
          onClick={onLogout} 
          className="ml-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Logout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
