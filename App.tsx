
import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';
import { Page, Profile, Project, ProjectStatus } from './types';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import SetupPage from './components/SetupPage';
import NewProjectPage from './components/NewProjectPage';
import AdminPanel from './components/AdminPanel';

type NewProjectFormData = {
  name: string;
  description:string;
  start_date: string;
  end_date: string;
  teamMemberIds: string[];
};

const App: React.FC = () => {
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  useEffect(() => {
    const supabaseUrl = localStorage.getItem('supabaseUrl');
    const supabaseAnonKey = localStorage.getItem('supabaseAnonKey');
    if (supabaseUrl && supabaseAnonKey) {
      setIsSupabaseConfigured(true);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isSupabaseConfigured]);

  const fetchAllData = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profileError) throw profileError;
      setUserProfile(profileData);

      // Fetch projects with related data using a more robust query
      // Admins will see all projects due to RLS policies; other users will only see their own.
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          tasks(*),
          milestones(*),
          project_team_members(*, profiles(*))
        `)
        .order('created_at', { ascending: false });
        
      if (projectsError) throw projectsError;

      const formattedProjects = (projectsData || []).map((p: any) => {
        const teamMembers = (p.project_team_members || [])
          .map((ptm: any) => ptm.profiles) // Use .profiles (plural, from table name)
          .filter(Boolean); // Filter out any null profiles from failed joins

        return {
          ...p,
          status: p.status as ProjectStatus,
          teamMembers: teamMembers
        };
      });
      setProjects(formattedProjects);

    } catch (error: any) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchAllData(session.user.id);
    } else {
      setLoading(false);
    }
  }, [session]);
  
  const handleAddProject = async (projectData: NewProjectFormData) => {
    if (!session?.user) return;
    try {
        const { data: newProject, error: projectError } = await supabase
            .from('projects')
            .insert([{
                name: projectData.name,
                description: projectData.description,
                start_date: projectData.start_date,
                end_date: projectData.end_date,
                status: ProjectStatus.Planning,
                created_by: session.user.id,
            }])
            .select()
            .single();

        if (projectError) throw projectError;

        if (!newProject) {
            alert("Error adding project: Could not create project record.");
            return;
        }

        const creatorId = session.user.id;
        const finalTeamMemberIds = projectData.teamMemberIds.includes(creatorId)
            ? projectData.teamMemberIds
            : [...projectData.teamMemberIds, creatorId];

        if (finalTeamMemberIds && finalTeamMemberIds.length > 0) {
            const teamMembersData = finalTeamMemberIds.map((userId: string) => ({
                project_id: newProject.id,
                user_id: userId,
            }));

            const { error: teamError } = await supabase
                .from('project_team_members')
                .insert(teamMembersData);
            
            if (teamError) throw teamError;
        }

        await fetchAllData(session.user.id);
        // Navigate to the projects list after successful creation
        navigateTo(Page.Projects);

    } catch (error: any) {
        alert("Error adding project: " + error.message);
    }
  };
  
  const handleProjectUpdate = (updatedProject: Project) => {
    setProjects(prevProjects => prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const navigateTo = (page: Page, projectId?: number) => {
    setCurrentPage(page);
    if (projectId) {
      setSelectedProjectId(projectId);
    } else {
      setSelectedProjectId(null);
    }
  };

  const handleSupabaseConfigured = () => {
    window.location.reload();
  };

  if (!isSupabaseConfigured) {
    return <SetupPage onConfigured={handleSupabaseConfigured} />;
  }

  if (!session) {
    return <LoginPage />;
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const renderContent = () => {
    switch (currentPage) {
      case Page.Projects:
        return <ProjectList userProfile={userProfile} navigateTo={navigateTo} projects={projects} />;
      case Page.ProjectDetail:
        return selectedProject ? <ProjectDetail userProfile={userProfile} project={selectedProject} onProjectUpdate={handleProjectUpdate} /> : <div>Project not found</div>;
      case Page.NewProject:
        return <NewProjectPage onAddProject={handleAddProject} />;
      case Page.AdminPanel:
        return <AdminPanel currentUserProfile={userProfile} navigateTo={navigateTo} />;
      case Page.Dashboard:
      default:
        return <Dashboard navigateTo={navigateTo} projects={projects} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar currentPage={currentPage} navigateTo={navigateTo} userProfile={userProfile} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={userProfile} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
            {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
