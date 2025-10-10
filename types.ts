export enum Page {
  Dashboard = 'DASHBOARD',
  Projects = 'PROJECTS',
  ProjectDetail = 'PROJECT_DETAIL',
  Tasks = 'TASKS',
  Schedule = 'SCHEDULE',
  Budget = 'BUDGET',
  Team = 'TEAM'
}

export enum UserRole {
  Admin = 'Admin',
  ProjectManager = 'Project Manager',
  Engineer = 'Engineer',
  Subcontractor = 'Subcontractor'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
}

export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  InReview = 'In Review',
  Done = 'Done'
}

export enum TaskPriority {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low'
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
}

export enum ProjectStatus {
  Planning = 'Planning',
  Active = 'Active',
  Completed = 'Completed',
  OnHold = 'On Hold'
}

export interface Milestone {
  id: string;
  name: string;
  date: string;
  completed: boolean;
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
  tasks: Task[];
  teamMemberIds: string[];
  milestones: Milestone[];
}