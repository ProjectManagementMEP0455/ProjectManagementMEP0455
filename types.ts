
export enum UserRole {
  Admin = 'Admin',
  ProjectDirector = 'Project Director',
  ProjectManager = 'Project Manager',
  AssistantProjectManager = 'Assistant Project Manager',
  EngineerSupervisor = 'Engineer / Supervisor',
  SiteEngineerTechnician = 'Site Engineer / Technician',
}

export interface Profile {
  id: string; // uuid
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole | null;
}

export enum ProjectStatus {
  Active = 'Active',
  Planning = 'Planning',
  Completed = 'Completed',
  OnHold = 'On Hold',
}

export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  Done = 'Done',
}

export interface Task {
  id: number;
  created_at: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  assignee_id: string | null; // uuid, foreign key to profiles.id
  project_id: number; // foreign key to projects.id
  percent_complete: number | null;
  assignee?: Profile | null; // Optional, for joined data
}

export interface Milestone {
  id: number;
  created_at: string;
  name: string;
  due_date: string;
  project_id: number;
  completed: boolean;
}

export type MilestoneInsert = Omit<Milestone, 'id' | 'created_at' | 'completed'>;

export interface ProjectTeamMember {
  profile: Profile;
}

export interface Project {
  id: number;
  created_at: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  spent: number | null;
  status: ProjectStatus;
  created_by: string; // uuid
  tasks: Task[];
  milestones: Milestone[];
  project_team_members: ProjectTeamMember[];
  teamMembers?: Profile[]; 
}

export enum Page {
  Dashboard = 'dashboard',
  Projects = 'projects',
  ProjectDetail = 'project-detail',
  NewProject = 'new-project',
  AdminPanel = 'admin-panel',
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        // FIX: Expanded Insert and Update types to include all possible fields,
        // which resolves issues with Supabase client type inference.
        Insert: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole | null;
        };
      };
      projects: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          budget: number | null;
          spent: number | null;
          status: ProjectStatus;
          created_by: string;
        };
        // FIX: Expanded Insert and Update types to include all possible fields from Row.
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          created_by: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          spent?: number | null;
          status?: ProjectStatus;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          spent?: number | null;
          status?: ProjectStatus;
          created_by?: string;
        };
      };
      tasks: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          description: string | null;
          status: TaskStatus;
          due_date: string | null;
          assignee_id: string | null;
          project_id: number;
          percent_complete: number | null;
        };
        // FIX: Expanded Insert and Update types to include all possible fields from Row.
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          project_id: number;
          description?: string | null;
          status?: TaskStatus;
          due_date?: string | null;
          assignee_id?: string | null;
          percent_complete?: number | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          description?: string | null;
          status?: TaskStatus;
          due_date?: string | null;
          assignee_id?: string | null;
          project_id?: number;
          percent_complete?: number | null;
        };
      };
      milestones: {
        Row: {
            id: number;
            created_at: string;
            name: string;
            due_date: string;
            project_id: number;
            completed: boolean;
        };
        // FIX: Expanded Insert and Update types to include all possible fields from Row.
        Insert: {
            id?: number;
            created_at?: string;
            name: string;
            due_date: string;
            project_id: number;
            completed?: boolean;
        };
        Update: {
            id?: number;
            created_at?: string;
            name?: string;
            due_date?: string;
            project_id?: number;
            completed?: boolean;
        };
      };
      project_team_members: {
        Row: {
          project_id: number;
          user_id: string;
        };
        Insert: {
          project_id: number;
          user_id: string;
        };
        Update: {};
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};