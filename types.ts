
export enum UserRole {
  Admin = 'Admin',
  ProjectDirector = 'Project Director',
  ProjectManager = 'Project Manager',
  AssistantProjectManager = 'Assistant Project Manager',
  EngineerSupervisor = 'Engineer / Supervisor',
  SiteEngineerTechnician = 'Site Engineer / Technician',
  OfficeAccountant = 'Office Accountant',
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

export enum RequestStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Processed = 'Processed',
}

export enum ProjectCompletionMethod {
    BasedOnTasks = 'BASED_ON_TASKS',
    BasedOnBudget = 'BASED_ON_BUDGET',
    BasedOnMilestones = 'BASED_ON_MILESTONES',
}

export interface Task {
  id: number;
  created_at: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  start_date: string | null;
  due_date: string | null;
  assignee_id: string | null; // uuid, foreign key to profiles.id
  project_id: number; // foreign key to projects.id
  percent_complete: number | null;
  assignee?: Profile | null; // Optional, for joined data
  budgeted_cost: number | null;
  spent_cost: number | null;
  pending_approval?: boolean;
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

export interface Expense {
    id: number;
    created_at: string;
    task_id: number;
    project_id: number;
    description: string;
    amount: number;
    created_by: string;
    document_url: string | null;
    expense_date: string;
    task?: { name: string };
    creator?: { full_name: string };
}

export interface Request {
    id: number;
    created_at: string;
    project_id: number;
    requested_by: string;
    description: string;
    estimated_cost: number;
    status: RequestStatus;
    reviewed_by: string | null;
    review_notes: string | null;
    linked_expense_id: number | null;
    requester?: { full_name: string };
    document_url: string | null;
    quantity: number | null;
    unit: string | null;
}

export interface ProgressPhoto {
    id: number;
    created_at: string;
    project_id: number;
    uploaded_by: string;
    photo_url: string;
    caption: string | null;
    photo_date: string;
    uploader?: { full_name: string };
}

export interface Material {
    id: number;
    created_at: string;
    name: string;
    unit: string | null;
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
          start_date: string | null;
          due_date: string | null;
          assignee_id: string | null;
          project_id: number;
          percent_complete: number | null;
          budgeted_cost: number | null;
          spent_cost: number | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          project_id: number;
          description?: string | null;
          status?: TaskStatus;
          start_date?: string | null;
          due_date?: string | null;
          assignee_id?: string | null;
          percent_complete?: number | null;
          budgeted_cost?: number | null;
          spent_cost?: number | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          description?: string | null;
          status?: TaskStatus;
          start_date?: string | null;
          due_date?: string | null;
          assignee_id?: string | null;
          project_id?: number;
          percent_complete?: number | null;
          budgeted_cost?: number | null;
          spent_cost?: number | null;
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
      expenses: {
        Row: Expense;
        Insert: Omit<Expense, 'id' | 'created_at'>;
        Update: Partial<Omit<Expense, 'id' | 'created_at'>>;
      };
      requests: {
        Row: Omit<Request, 'requester'>;
        Insert: Omit<Request, 'id' | 'created_at' | 'requester'>;
        Update: Partial<Omit<Request, 'id' | 'created_at' | 'requester'>>;
      };
      progress_photos: {
        Row: ProgressPhoto;
        Insert: Omit<ProgressPhoto, 'id' | 'created_at'>;
        Update: Partial<Omit<ProgressPhoto, 'id' | 'created_at'>>;
      };
      materials_master: {
        Row: Material;
        Insert: Omit<Material, 'id' | 'created_at'>;
        Update: Partial<Omit<Material, 'id' | 'created_at'>>;
      };
      app_settings: {
        Row: {
          key: string;
          value: string;
        };
        Insert: {
          key: string;
          value: string;
        };
        Update: {
          key?: string;
          value?: string;
        };
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