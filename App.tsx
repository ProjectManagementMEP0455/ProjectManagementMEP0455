import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import LoginPage from './components/LoginPage';
import AddProjectModal from './components/AddProjectModal';
import { Page, Project, ProjectStatus } from './types';
import { MOCK_PROJECTS } from './constants';

// Omit type from AddProjectModal
type NewProjectData = Omit<Project, 'id' | 'status' | 'spent' | 'milestones' | 'tasks'>;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  const navigateTo = (page: Page, projectId?: string) => {
    setCurrentPage(page);
    if (projectId) {
      setCurrentProjectId(projectId);
    } else if (page !== Page.ProjectDetail) {
      setCurrentProjectId(null);
    }
  };

  const handleAddProject = (projectData: NewProjectData) => {
    const newProject: Project = {
        ...projectData,
        id: `p${Date.now()}`,
        status: ProjectStatus.Planning,
        spent: 0,
        milestones: [],
        tasks: []
    };
    setProjects(prev => [newProject, ...prev]);
    setIsAddProjectModalOpen(false);
    navigateTo(Page.Projects);
  };

  const renderContent = () => {
    if (currentProjectId && currentPage === Page.ProjectDetail) {
      const project = projects.find(p => p.id === currentProjectId);
      return project ? <ProjectDetail project={project} /> : <div>Project not found</div>;
    }

    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard navigateTo={navigateTo} projects={projects} />;
      case Page.Projects:
        return <ProjectList navigateTo={navigateTo} projects={projects} onOpenAddProjectModal={() => setIsAddProjectModalOpen(true)} />;
      default:
        return <Dashboard navigateTo={navigateTo} projects={projects} />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      <Sidebar currentPage={currentPage} navigateTo={navigateTo} />
      <div className="flex-1 flex flex-col">
        <Header onLogout={() => setIsLoggedIn(false)} />
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      <AddProjectModal 
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onAddProject={handleAddProject}
      />
    </div>
  );
}

export default App;
