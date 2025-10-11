import React, { useState } from 'react';
import Avatar from './ui/Avatar';
import { Profile } from '../types';
import { supabase } from '../lib/supabaseClient';
import ThemeToggle from './ui/ThemeToggle';
import Button from './ui/Button';

interface HeaderProps {
    user: Profile | null;
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (isCollapsed: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ user, isSidebarCollapsed, setIsSidebarCollapsed }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="h-20 bg-background/80 backdrop-blur-lg border-b border-border flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
      <div className="flex items-center space-x-2">
        <Button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            variant="ghost"
            size="sm"
            className="w-9 h-9 px-0"
            aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
        </Button>
         <h1 className="text-xl font-semibold text-foreground hidden sm:block">MEP Project Management</h1>
      </div>
      {user && (
        <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2">
                     <div className="text-right hidden md:block">
                        <p className="font-semibold text-sm text-foreground">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                    </div>
                    <Avatar profile={user} size="lg" />
                </button>
                {isDropdownOpen && (
                    <div 
                        className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg z-10 p-2"
                        onMouseLeave={() => setIsDropdownOpen(false)}
                    >
                        <Button 
                            onClick={handleLogout} 
                            variant="ghost"
                            className="w-full justify-start"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>}
                        >
                            Logout
                        </Button>
                    </div>
                )}
            </div>
        </div>
      )}
    </header>
  );
};

export default Header;