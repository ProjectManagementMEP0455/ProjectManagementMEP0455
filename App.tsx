import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import { Page, Project, ProjectStatus } from './types';
import { MOCK_PROJECTS } from './constants';
import AddProjectModal from './components/AddProjectModal';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(MOCK_PROJECTS[0].id);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  const navigateTo = useCallback((page: Page, projectId: string | null = null) => {
    setCurrentPage(page);
    setSelectedProjectId(projectId);
  }, []);
  
  const handleAddProject = (newProjectData: Omit<Project, 'id' | 'status' | 'spent' | 'milestones' | 'tasks'>) => {
    const newProject: Project = {
      ...newProjectData,
      id: `p${Date.now()}`,
      status: ProjectStatus.Planning,
      spent: 0,
      milestones: [],
      tasks: [],
    };
    setProjects(prevProjects => [newProject, ...prevProjects]);
    setIsAddProjectModalOpen(false);
  };

  const renderContent = () => {
    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard navigateTo={navigateTo} projects={projects} />;
      case Page.Projects:
        return <ProjectList navigateTo={navigateTo} projects={projects} onOpenAddProjectModal={() => setIsAddProjectModalOpen(true)} />;
      case Page.ProjectDetail:
        const project = projects.find(p => p.id === selectedProjectId);
        return project ? <ProjectDetail project={project} /> : <div className="p-8 text-neutral-dark">Project not found.</div>;
      default:
        return <Dashboard navigateTo={navigateTo} projects={projects} />;
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
       <AddProjectModal 
        isOpen={isAddProjectModalOpen}
        onClose={() => setIsAddProjectModalOpen(false)}
        onAddProject={handleAddProject}
      />
    </div>
  );
};

export default App;