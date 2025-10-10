import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import LoginPage from './components/LoginPage';
import AddProjectModal from './components/AddProjectModal';
import { Page, Project, ProjectStatus, Task, Profile } from './types';
import { supabase } from './lib/supabaseClient';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchProfile();
      fetchProjects();
    }
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (error) throw error;
      if (data) setProfile(data);
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_team_members(profiles(*)),
          tasks(*),
          milestones(*)
        `);

      if (error) throw error;
      
      const formattedProjects = data.map(p => ({
        ...p,
        teamMembers: p.project_team_members.map((ptm: any) => ptm.profiles),
      }));

      setProjects(formattedProjects);
    } catch (error: any) {
      console.error('Error fetching projects:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (page: Page, projectId?: number) => {
    setCurrentPage(page);
    setCurrentProjectId(projectId || null);
  };

  const handleAddProject = async (newProjectData: Omit<Project, 'id' | 'status' | 'spent' | 'milestones' | 'tasks' | 'teamMembers' | 'created_at' | 'project_team_members' | 'created_by'>) => {
    if (!session?.user) return;
    
    try {
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({ ...newProjectData, created_by: session.user.id })
        .select()
        .single();

      if (error) throw error;
      
      // After project creation, we re-fetch all projects to get the updated list
      // including the new team member relationship created by the trigger.
      await fetchProjects();
      setIsAddProjectModalOpen(false);
      navigateTo(Page.Projects);

    } catch (error: any) {
      alert('Error creating project: ' + error.message);
    }
  };

  const handleProjectUpdate = async (updatedProject: Project) => {
     setProjects(prevProjects => 
        prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p)
    );
    // You might want to persist smaller updates directly to supabase here
    // For simplicity, we are handling updates within the detail view for now
  }

  const renderContent = () => {
    if (loading) {
        return <div className="flex justify-center items-center h-full"><p>Loading...</p></div>;
    }
    if (currentPage === Page.ProjectDetail && currentProjectId) {
      const project = projects.find(p => p.id === currentProjectId);
      if (project) {
        return <ProjectDetail project={project} onProjectUpdate={handleProjectUpdate} />;
      }
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

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar currentPage={currentPage} navigateTo={navigateTo} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={profile} />
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
