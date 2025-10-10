export enum Page {
  Dashboard = 'dashboard',
  Projects = 'projects',
  ProjectDetail = 'project-detail',
}

export enum UserRole {
  ProjectManager = 'Project Manager',
  Engineer = 'Engineer',
  Subcontractor = 'Subcontractor',
  Admin = 'Admin',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
}

export enum ProjectStatus {
  Active = 'Active',
  Planning = 'Planning',
  Completed = 'Completed',
  OnHold = 'On Hold',
}

export interface Milestone {
  id: string;
  name: string;
  date: string;
  completed: boolean;
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

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: string;
  dueDate: string;
  assigneeIds: string[];
  dependencies?: string[];
  equipmentSpecs?: string;
  installationPhase?: string;
  inspectionChecklist?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  status: ProjectStatus;
  teamMemberIds: string[];
  milestones: Milestone[];
  tasks: Task[];
}
