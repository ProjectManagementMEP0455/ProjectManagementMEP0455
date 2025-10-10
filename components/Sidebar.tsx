import React from 'react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

const ICONS = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 12h16M4 19h16" /></svg>,
    projects: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" /></svg>,
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigateTo }) => {
  const navItems = [
    { page: Page.Dashboard, label: 'Dashboard', icon: ICONS.dashboard },
    { page: Page.Projects, label: 'Projects', icon: ICONS.projects },
  ];

  return (
    <aside className="w-64 bg-neutral-dark text-white flex flex-col">
      <div className="h-20 flex items-center justify-center text-2xl font-bold text-brand-primary">
        MEP-Dash
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => navigateTo(item.page)}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
              currentPage === item.page
                ? 'bg-brand-primary text-white'
                : 'text-neutral-light hover:bg-neutral-medium hover:text-white'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-neutral-medium">
        <p className="text-sm text-neutral-light">&copy; 2024 MEP-Dash Inc.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
