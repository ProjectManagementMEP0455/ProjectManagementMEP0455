
import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import LoginPage from './components/LoginPage';
import AddProjectModal from './components/AddProjectModal';
import SetupPage from './components/SetupPage';
import { Page, Project, ProjectStatus, Task, Profile } from './types';
import { supabase } from './lib/supabaseClient';

// This is the data structure we expect from the AddProjectModal form
type NewProjectFormData = Omit<Project, 'id' | 'status' | 'spent' | 'milestones' | 'tasks' | 'teamMembers' | 'created_at' | 'project_team_members' | 'created_by'> & {
  teamMemberIds: string[];
};


const App: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First, check if the app is configured with Supabase credentials
    const url = localStorage.getItem('supabaseUrl');
    const key = localStorage.getItem('supabaseAnonKey');
    if (url && key && url !== 'https://your-project-id.supabase.co') {
      setIsConfigured(true);
    } else {
      setLoading(false); // Not configured, stop loading
    }
  }, []);

  useEffect(() => {
    if (!isConfigured) return;

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
  }, [isConfigured]);

  useEffect(() => {
    if (session && isConfigured) {
      fetchProfile();
      fetchProjects();
    }
  }, [session, isConfigured]);

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

  const handleAddProject = async (newProjectData: NewProjectFormData) => {
    if (!session?.user) return;
    
    try {
      const { teamMemberIds, ...projectDetails } = newProjectData;
      
      // 1. Create the project
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({ 
          ...projectDetails, 
          status: ProjectStatus.Planning,
          created_by: session.user.id 
        })
        .select()
        .single();

      if (projectError) throw projectError;
      
      // 2. Add all team members, including the creator.
      // Use a Set to handle cases where the creator might have also been selected in the form.
      const allMemberIds = new Set(teamMemberIds);
      allMemberIds.add(session.user.id);

      const membersToInsert = Array.from(allMemberIds).map(userId => ({
        project_id: newProject.id,
        user_id: userId,
      }));

      if (membersToInsert.length > 0) {
        const { error: teamError } = await supabase
          .from('project_team_members')
          .insert(membersToInsert);
        
        if (teamError) throw teamError;
      }
      
      // 3. Re-fetch all projects to get the updated list.
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
  }

  const handleConfigured = () => {
    window.location.reload();
  };

  if (loading && isConfigured) {
    return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
  }

  if (!isConfigured) {
    return <SetupPage onConfigured={handleConfigured} />;
  }

  if (!session) {
    return <LoginPage />;
  }

  const renderContent = () => {
    if (currentPage === Page.ProjectDetail && currentProjectId) {
      const project = projects.find(p => p.id === currentProjectId);
      if (project) {
        return <ProjectDetail project={project} onProjectUpdate={handleProjectUpdate} />;
      }
      // FIX: Handle the case where a project is not found for the given ID.
      // This prevents the function from implicitly returning undefined, which fixes
      // the root type error and the subsequent cascade of scope-related errors.
      return null;
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
