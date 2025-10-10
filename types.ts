export interface Profile {
  id: string; // uuid
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
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

export interface ProjectTeamMember {
  // FIX: The query in App.tsx only fetches the profile, not the IDs from the junction table.
  // This aligns the type with the actual data being returned.
  // project_id: number;
  // user_id: string; // uuid
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
  teamMembers?: Profile[]; // This seems to be populated client-side.
}

export enum Page {
  Dashboard = 'dashboard',
  Projects = 'projects',
  ProjectDetail = 'project-detail',
}


// FIX: Rewrote the Database type to avoid circular references which caused 'never' type errors.
// Insert and Update types are now defined explicitly.
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id'>;
        Update: Partial<Profile>;
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
        Update: Partial<{
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
        }>;
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
        Update: Partial<{
          id: number;
          created_at: string;
          name: string;
          description: string | null;
          status: string;
          due_date: string | null;
          assignee_id: string | null;
          project_id: number;
          percent_complete: number | null;
        }>;
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
        Update: Partial<{
            id: number;
            created_at: string;
            name: string;
            due_date: string;
            project_id: number;
            completed: boolean;
        }>;
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
        Update: never;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      // FIX: The schema does not define any enum types; status columns are `text`.
      // This was causing the Supabase client to fail type inference.
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};