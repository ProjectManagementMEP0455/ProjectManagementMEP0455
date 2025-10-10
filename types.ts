export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
}

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
    InReview = 'In Review',
    Done = 'Done',
}

export enum TaskPriority {
    Critical = 'Critical',
    High = 'High',
    Medium = 'Medium',
    Low = 'Low',
}

export interface Milestone {
  id: string;
  name: string;
  date: string; // ISO string
  completed: boolean;
}

export interface Task {
  id:string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string; // ISO string
  dueDate: string; // ISO string
  assigneeIds: string[];
  dependencies?: string[];
  // MEP specific fields
  equipmentSpecs?: string;
  installationPhase?: string;
  inspectionChecklist?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string; // ISO string
  endDate: string; // ISO string
  budget: number;
  spent: number;
  teamMemberIds: string[];
  milestones: Milestone[];
  tasks: Task[];
}
