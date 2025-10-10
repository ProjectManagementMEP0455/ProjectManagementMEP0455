
export enum UserRole {
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
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id'>;
        // FIX: Update type now correctly omits the non-updatable 'id' field.
        Update: {
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
          status: string;
          created_by: string;
        };
        Insert: {
          name: string;
          created_by: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          spent?: number | null;
          status?: string;
        };
        // FIX: Update type now correctly omits non-updatable fields like 'id', 'created_at', and 'created_by'.
        Update: {
          name?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          spent?: number | null;
          status?: string;
        };
      };
      tasks: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          description: string | null;
          status: string;
          due_date: string | null;
          assignee_id: string | null;
          project_id: number;
          percent_complete: number | null;
        };
        Insert: {
          name: string;
          project_id: number;
          description?: string | null;
          status?: string;
          due_date?: string | null;
          assignee_id?: string | null;
          percent_complete?: number | null;
        };
        // FIX: Update type now correctly omits non-updatable fields like 'id', 'created_at', and 'project_id'.
        Update: {
          name?: string;
          description?: string | null;
          status?: string;
          due_date?: string | null;
          assignee_id?: string | null;
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
        Insert: {
            name: string;
            due_date: string;
            project_id: number;
            completed?: boolean;
        };
        // FIX: Update type now correctly omits non-updatable fields like 'id', 'created_at', and 'project_id'.
        Update: {
            name?: string;
            due_date?: string;
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
        // FIX: Changed 'never' to '{}' to prevent potential issues with Supabase type inference engine.
        // An empty object indicates no fields are updatable, which is more compatible than 'never'.
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