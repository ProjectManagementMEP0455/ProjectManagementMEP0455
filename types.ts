// FIX: Define and export all necessary types for the application.
// This creates a central module for types, resolving errors where
// files attempted to import from a non-existent or empty types file.
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

export interface User {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
}

export interface Task {
    id: string;
    name: string;
    description: string;
    status: TaskStatus;
    assigneeId: string | null;
    dueDate: string;
}

export interface Milestone {
    id: string;
    name: string;
    dueDate: string;
    completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  teamMemberIds: string[];
  milestones: Milestone[];
  tasks: Task[];
}
