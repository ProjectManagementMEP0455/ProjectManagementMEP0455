import { Project, ProjectStatus, User, Task, TaskStatus, Milestone } from './types';

// FIX: Define and export mock data constants used across the application.
// This resolves errors where components tried to import from a non-existent or empty constants file.
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Johnson', role: 'Project Manager', avatarUrl: 'https://i.pravatar.cc/150?u=alice' },
  { id: 'u2', name: 'Bob Williams', role: 'Mechanical Engineer', avatarUrl: 'https://i.pravatar.cc/150?u=bob' },
  { id: 'u3', name: 'Charlie Brown', role: 'Electrical Engineer', avatarUrl: 'https://i.pravatar.cc/150?u=charlie' },
  { id: 'u4', name: 'Diana Prince', role: 'Plumbing Designer', avatarUrl: 'https://i.pravatar.cc/150?u=diana' },
];

const MOCK_TASKS_P1: Task[] = [
    { id: 't1-1', name: 'Initial HVAC layout design', description: 'Draft the initial layout for the HVAC system.', status: TaskStatus.Done, assigneeId: 'u2', dueDate: '2024-07-20' },
    { id: 't1-2', name: 'Submit electrical plans for review', description: 'Finalize and submit the electrical schematics.', status: TaskStatus.InProgress, assigneeId: 'u3', dueDate: '2024-07-25' },
    { id: 't1-3', name: 'Plumbing riser diagram', description: 'Create the main plumbing riser diagram for all floors.', status: TaskStatus.ToDo, assigneeId: 'u4', dueDate: '2024-08-01' },
    { id: 't1-4', name: 'Install new rooftop chiller unit', description: 'Coordinate crane and installation team for the new chiller.', status: TaskStatus.ToDo, assigneeId: 'u2', dueDate: '2024-08-10' },
];

const MOCK_TASKS_P2: Task[] = [
    { id: 't2-1', name: 'Client requirement gathering', description: 'Meet with client to finalize MEP requirements.', status: TaskStatus.Done, assigneeId: 'u1', dueDate: '2024-07-15' },
    { id: 't2-2', name: 'Feasibility study for solar panels', description: 'Analyze roof structure and energy needs for solar panel integration.', status: TaskStatus.InProgress, assigneeId: 'u3', dueDate: '2024-08-05' },
];

const MOCK_MILESTONES_P1: Milestone[] = [
    { id: 'm1-1', name: 'Design Approval', dueDate: '2024-07-30', completed: true },
    { id: 'm1-2', name: 'Permits Acquired', dueDate: '2024-08-15', completed: false },
    { id: 'm1-3', name: 'Construction Start', dueDate: '2024-09-01', completed: false },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Downtown Tower HVAC Upgrade',
    description: 'A comprehensive upgrade of the HVAC system for the 30-story Downtown Tower, including new chillers, air handling units, and a building automation system.',
    status: ProjectStatus.Active,
    startDate: '2024-07-01',
    endDate: '2024-12-31',
    budget: 50000000, // 5 Cr
    spent: 12500000, // 1.25 Cr
    teamMemberIds: ['u1', 'u2', 'u3'],
    milestones: MOCK_MILESTONES_P1,
    tasks: MOCK_TASKS_P1,
  },
  {
    id: 'p2',
    name: 'Corporate Campus Electrical Fit-out',
    description: 'Design and implementation of the complete electrical and low-voltage systems for a new 5-building corporate campus. Focus on energy efficiency and smart building controls.',
    status: ProjectStatus.Active,
    startDate: '2024-08-15',
    endDate: '2025-05-30',
    budget: 80000000, // 8 Cr
    spent: 5000000, // 50 L
    teamMemberIds: ['u1', 'u3', 'u4'],
    milestones: [],
    tasks: MOCK_TASKS_P2,
  },
  {
    id: 'p3',
    name: 'Luxury Hotel Plumbing System',
    description: 'Full plumbing system design for a new 200-room luxury hotel, including water supply, drainage, and a high-efficiency hot water plant.',
    status: ProjectStatus.Planning,
    startDate: '2024-09-01',
    endDate: '2025-08-31',
    budget: 35000000, // 3.5 Cr
    spent: 800000, // 8 L
    teamMemberIds: ['u1', 'u4'],
    milestones: [],
    tasks: [],
  },
  {
    id: 'p4',
    name: 'Mall Fire Protection System',
    description: 'Retrofitting the existing fire sprinkler and alarm systems for the Metro Shopping Mall to meet new safety codes.',
    status: ProjectStatus.Completed,
    startDate: '2023-01-10',
    endDate: '2024-01-20',
    budget: 20000000, // 2 Cr
    spent: 19500000, // 1.95 Cr
    teamMemberIds: ['u1', 'u2'],
    milestones: [],
    tasks: [],
  },
  {
    id: 'p5',
    name: 'Hospital Wing Expansion',
    description: 'MEP design for a new 50-bed hospital wing, with a focus on medical gas systems, specialized ventilation, and emergency power.',
    status: ProjectStatus.OnHold,
    startDate: '2024-05-01',
    endDate: '2025-04-30',
    budget: 60000000, // 6 Cr
    spent: 4500000, // 45 L
    teamMemberIds: ['u1', 'u2', 'u3', 'u4'],
    milestones: [],
    tasks: [],
  },
];
