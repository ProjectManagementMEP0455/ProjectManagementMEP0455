
import React from 'react';
import { MOCK_USERS } from '../constants';
import Avatar from './ui/Avatar';
import { ICONS } from '../constants';

const Header: React.FC = () => {
  const currentUser = MOCK_USERS.find(u => u.role === 'Project Manager');

  return (
    <header className="bg-white h-16 flex items-center justify-between px-6 border-b border-gray-200">
      <div className="flex items-center">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            {ICONS.search}
          </span>
          <input
            type="text"
            placeholder="Search projects, tasks..."
            className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <button className="relative text-gray-500 hover:text-brand-primary">
          {ICONS.bell}
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-status-red text-white text-xs rounded-full flex items-center justify-center">3</span>
        </button>
        {currentUser && (
          <div className="flex items-center space-x-3">
            <Avatar user={currentUser} size="lg" />
            <div>
              <p className="font-semibold text-neutral-dark">{currentUser.name}</p>
              <p className="text-sm text-neutral-medium">{currentUser.role}</p>
            </div>
            <button className="text-gray-500 hover:text-brand-primary">
                {ICONS.chevronDown}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
