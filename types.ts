// types.ts

// --- FRONTEND-SPECIFIC TYPES ---

export enum Page {
  Dashboard = 'Dashboard',
  Projects = 'Projects',
  ProjectDetail = 'ProjectDetail',
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


// --- SUPABASE DATABASE TYPES ---
// These types are generated from the database schema.
// You can generate this automatically using `supabase gen types typescript > types.ts`

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      milestones: {
        Row: {
          completed: boolean | null
          created_at: string
          due_date: string
          id: number
          name: string
          project_id: number
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          due_date: string
          id?: number
          name: string
          project_id: number
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          due_date?: string
          id?: number
          name?: string
          project_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      project_team_members: {
        Row: {
          project_id: number
          user_id: string
        }
        Insert: {
          project_id: number
          user_id: string
        }
        Update: {
          project_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_team_members_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_team_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          budget: number | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string | null
          id: number
          name: string
          spent: number | null
          start_date: string | null
          status: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: number
          name: string
          spent?: number | null
          start_date?: string | null
          status?: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string | null
          id?: number
          name?: string
          spent?: number | null
          start_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: number
          name: string
          percent_complete: number | null
          project_id: number
          status: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: number
          name: string
          percent_complete?: number | null
          project_id: number
          status?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: number
          name?: string
          percent_complete?: number | null
          project_id?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// --- AUGMENTED FRONTEND TYPES ---
// Combining database types with frontend requirements like nested relationships.

type DbProject = Database['public']['Tables']['projects']['Row'];
type DbTask = Database['public']['Tables']['tasks']['Row'];
type DbMilestone = Database['public']['Tables']['milestones']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface Task extends DbTask {}
export interface Milestone extends DbMilestone {}

export interface Project extends DbProject {
  tasks: Task[];
  milestones: Milestone[];
  teamMembers: Profile[];
  project_team_members: { profiles: Profile }[]; // For Supabase query structure
}
