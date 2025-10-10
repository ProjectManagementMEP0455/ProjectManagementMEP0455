
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import { Page } from './types';
import { MOCK_PROJECTS } from './constants';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(MOCK_PROJECTS[0].id);

  const navigateTo = useCallback((page: Page, projectId: string | null = null) => {
    setCurrentPage(page);
    setSelectedProjectId(projectId);
  }, []);
  
  const renderContent = () => {
    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard navigateTo={navigateTo} />;
      case Page.Projects:
        return <ProjectList navigateTo={navigateTo} />;
      case Page.ProjectDetail:
        const project = MOCK_PROJECTS.find(p => p.id === selectedProjectId);
        return project ? <ProjectDetail project={project} /> : <div className="p-8 text-neutral-dark">Project not found.</div>;
      default:
        return <Dashboard navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="flex h-screen bg-neutral-light font-sans">
      <Sidebar currentPage={currentPage} navigateTo={navigateTo} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-neutral-light p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
