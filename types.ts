
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
  NewProject = 'new-project',
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id'>;
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
          // FIX: Changed type from string to ProjectStatus enum for better type safety.
          status: ProjectStatus;
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
          // FIX: Changed type from string to ProjectStatus enum for better type safety.
          status?: ProjectStatus;
        };
        Update: {
          name?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          budget?: number | null;
          spent?: number | null;
          // FIX: Changed type from string to ProjectStatus enum for better type safety.
          status?: ProjectStatus;
        };
      };
      tasks: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          description: string | null;
          // FIX: Changed type from string to TaskStatus enum for better type safety.
          status: TaskStatus;
          due_date: string | null;
          assignee_id: string | null;
          project_id: number;
          percent_complete: number | null;
        };
        Insert: {
          name: string;
          project_id: number;
          description?: string | null;
          // FIX: Changed type from string to TaskStatus enum for better type safety.
          status?: TaskStatus;
          due_date?: string | null;
          assignee_id?: string | null;
          percent_complete?: number | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          // FIX: Changed type from string to TaskStatus enum for better type safety.
          status?: TaskStatus;
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