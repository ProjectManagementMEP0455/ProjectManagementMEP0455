import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import LoginPage from './components/LoginPage';
import AddProjectModal from './components/AddProjectModal';
import { Page, Project, ProjectStatus, Task } from './types';
import { MOCK_PROJECTS } from './constants';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  const navigateTo = (page: Page, projectId?: string) => {
    setCurrentPage(page);
    setCurrentProjectId(projectId || null);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage(Page.Dashboard);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };
  
  const handleAddProject = (newProjectData: Omit<Project, 'id' | 'status' | 'spent' | 'milestones' | 'tasks'>) => {
    const newProject: Project = {
        ...newProjectData,
        id: `p${projects.length + 1}`,
        status: ProjectStatus.Planning,
        spent: 0,
        milestones: [],
        tasks: [],
    };
    setProjects(prevProjects => [newProject, ...prevProjects]);
    setIsAddProjectModalOpen(false);
    navigateTo(Page.Projects);
  };
  
  const updateProjectTasks = (projectId: string, tasks: Task[]) => {
    setProjects(prevProjects => 
        prevProjects.map(p => p.id === projectId ? {...p, tasks} : p)
    );
  }

  const renderContent = () => {
    if (currentPage === Page.ProjectDetail && currentProjectId) {
      const project = projects.find(p => p.id === currentProjectId);
      if (project) {
        return <ProjectDetail project={project} onTasksUpdate={updateProjectTasks} />;
      }
    }
    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard navigateTo={navigateTo} projects={projects} />;
      case Page.Projects:
        return <ProjectList navigateTo={navigateTo} projects={projects} onOpenAddProjectModal={() => setIsAddProjectModalOpen(true)} />;
      default:
        // FIX: Add a default case to render the Dashboard if the page is unknown.
        // This resolves a potential issue where no content is rendered.
        return <Dashboard navigateTo={navigateTo} projects={projects} />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} navigateTo={navigateTo} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={handleLogout}/>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
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
};

export default App;
