
import React from 'react';
import { Page, Profile, UserRole } from '../types';

interface SidebarProps {
  currentPage: Page;
  navigateTo: (page: Page) => void;
  userProfile: Profile | null;
}

const ICONS = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 12h16M4 19h16" /></svg>,
    projects: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" /></svg>,
    newProject: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    sqlEditor: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, navigateTo, userProfile }) => {
  const navItems = [
    { page: Page.Dashboard, label: 'Dashboard', icon: ICONS.dashboard, requiredRole: null },
    { page: Page.Projects, label: 'Projects', icon: ICONS.projects, requiredRole: null },
    { page: Page.NewProject, label: 'New Project', icon: ICONS.newProject, requiredRole: UserRole.ProjectDirector },
  ];

  const visibleNavItems = navItems.filter(item => {
    return !item.requiredRole || userProfile?.role === item.requiredRole;
  });
  
  const getSqlEditorUrl = () => {
    const supabaseUrl = localStorage.getItem('supabaseUrl');
    if (!supabaseUrl) return null;
    try {
      const url = new URL(supabaseUrl);
      const projectRef = url.hostname.split('.')[0];
      if (!projectRef) return null;
      return `https://app.supabase.com/project/${projectRef}/sql/new`;
    } catch (e) {
      console.error("Could not parse Supabase URL:", e);
      return null;
    }
  };

  const sqlEditorUrl = getSqlEditorUrl();

  return (
    <aside className="w-64 bg-neutral-dark text-white flex flex-col">
      <div className="h-20 flex items-center justify-center text-2xl font-bold text-brand-primary">
        MEP-Dash
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {visibleNavItems.map(item => (
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
        {userProfile?.role === UserRole.ProjectDirector && sqlEditorUrl && (
            <a
                href={sqlEditorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center px-4 py-3 rounded-lg transition-colors text-neutral-light hover:bg-neutral-medium hover:text-white"
                aria-label="Open Supabase SQL Editor in a new tab"
            >
                <span className="mr-3">{ICONS.sqlEditor}</span>
                <span className="font-semibold">SQL Editor</span>
            </a>
        )}
      </nav>
      <div className="p-4 border-t border-neutral-medium">
        <p className="text-sm text-neutral-light">&copy; 2024 MEP-Dash Inc.</p>
      </div>
    </aside>
  );
};

export default Sidebar;