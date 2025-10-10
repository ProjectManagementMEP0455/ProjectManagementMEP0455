
import React from 'react';
import { Page } from '../types';
import { ICONS } from '../constants';

interface SidebarProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
      isActive ? 'bg-brand-dark text-white shadow-md' : 'text-gray-300 hover:bg-brand-primary/80 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigateTo }) => {
  return (
    <aside className="w-64 bg-brand-primary text-white flex flex-col p-4">
      <div className="flex items-center space-x-2 p-3 mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 16v-2m0-8v-2m0 4h.01M6 12h.01M18 12h.01M6 18H4m16 0h-2m0-12h-2M6 6H4m16 0h-2m-4 8a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h1 className="text-xl font-bold">MEP Pro</h1>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          <NavItem
            icon={ICONS.dashboard}
            label="Dashboard"
            isActive={currentPage === Page.Dashboard}
            onClick={() => navigateTo(Page.Dashboard)}
          />
          <NavItem
            icon={ICONS.projects}
            label="Projects"
            isActive={currentPage === Page.Projects || currentPage === Page.ProjectDetail}
            onClick={() => navigateTo(Page.Projects)}
          />
        </ul>
      </nav>
      <div className="mt-auto">
         <ul className="space-y-2">
           <NavItem
            icon={ICONS.settings}
            label="Settings"
            isActive={false}
            onClick={() => {}}
          />
           <NavItem
            icon={ICONS.logout}
            label="Logout"
            isActive={false}
            onClick={() => {}}
          />
         </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
