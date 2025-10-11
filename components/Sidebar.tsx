import React from 'react';
import { Page, Profile, UserRole } from '../types';

interface SidebarProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
  userProfile: Profile | null;
  isCollapsed: boolean;
}

const ICONS: { [key: string]: React.ReactNode } = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
    projects: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>,
    newProject: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    admin: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>,
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigateTo, userProfile, isCollapsed }) => {
  const navItems = [
    { page: Page.Dashboard, label: 'Dashboard', icon: ICONS.dashboard, allowedRoles: null },
    { page: Page.Projects, label: 'Projects', icon: ICONS.projects, allowedRoles: null },
    { page: Page.NewProject, label: 'New Project', icon: ICONS.newProject, allowedRoles: [UserRole.ProjectDirector, UserRole.Admin, UserRole.ProjectManager] },
    { page: Page.AdminPanel, label: 'Admin Panel', icon: ICONS.admin, allowedRoles: [UserRole.Admin] },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (!item.allowedRoles) return true;
    if (!userProfile?.role) return false;
    return item.allowedRoles.includes(userProfile.role);
  });

  return (
    <aside className={`bg-background border-r border-border flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="h-20 flex items-center justify-center border-b border-border">
        <span className={`text-2xl font-bold transition-all duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <span className="text-primary">MEP</span>
          <span className="text-foreground">-Dash</span>
        </span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {visibleNavItems.map(item => (
          <button
            key={item.page}
            onClick={() => navigateTo(item.page)}
            title={item.label}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
              currentPage === item.page
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className={`font-semibold ml-4 transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className={`p-4 border-t border-border transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-xs text-muted-foreground whitespace-nowrap">&copy; 2024 MEP-Dash Inc.</p>
      </div>
    </aside>
  );
};

export default Sidebar;