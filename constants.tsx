import React from 'react';
import { User, Project, ProjectStatus, Task, TaskStatus, TaskPriority, Milestone } from './types';

export const ICONS = {
    plus: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>,
};

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Johnson', avatarUrl: 'https://i.pravatar.cc/150?u=u1', role: 'Project Manager' },
  { id: 'u2', name: 'Bob Williams', avatarUrl: 'https://i.pravatar.cc/150?u=u2', role: 'Lead Engineer' },
  { id: 'u3', name: 'Charlie Brown', avatarUrl: 'https://i.pravatar.cc/150?u=u3', role: 'MEP Specialist' },
  { id: 'u4', name: 'Diana Miller', avatarUrl: 'https://i.pravatar.cc/150?u=u4', role: 'Architect' },
  { id: 'u5', name: 'Ethan Davis', avatarUrl: 'https://i.pravatar.cc/150?u=u5', role: 'Site Supervisor' },
];

const p1_tasks: Task[] = [
    { id: 'p1-t1', title: 'Install new rooftop chiller unit', description: 'Detailed description of chiller installation.', status: TaskStatus.InProgress, priority: TaskPriority.Critical, startDate: '2024-06-01', dueDate: '2024-06-15', assigneeIds: ['u2', 'u3'], dependencies: [] },
    { id: 'p1-t2', title: 'Electrical Rough-in for 5th Floor', description: 'Run conduit and wiring as per spec.', status: TaskStatus.ToDo, priority: TaskPriority.High, startDate: '2024-06-10', dueDate: '2024-06-25', assigneeIds: ['u3'], dependencies: ['p1-t1'] },
    { id: 'p1-t3', title: 'Plumbing for Core Restrooms', description: 'Install fixtures and connect water lines.', status: TaskStatus.Done, priority: TaskPriority.Medium, startDate: '2024-05-20', dueDate: '2024-06-05', assigneeIds: ['u3', 'u5'] },
    { id: 'p1-t4', title: 'Submit HVAC design for approval', description: 'Finalize and submit the HVAC design schematics.', status: TaskStatus.Done, priority: TaskPriority.High, startDate: '2024-05-15', dueDate: '2024-05-25', assigneeIds: ['u2', 'u4'] },
    { id: 'p1-t5', title: 'Review sprinkler system layout', description: 'Check for compliance with fire codes.', status: TaskStatus.InReview, priority: TaskPriority.Medium, startDate: '2024-06-05', dueDate: '2024-06-12', assigneeIds: ['u2'] },
];

const p1_milestones: Milestone[] = [
    { id: 'p1-m1', name: 'Design Approval', date: '2024-05-30', completed: true },
    { id: 'p1-m2', name: 'Core & Shell Completion', date: '2024-07-15', completed: false },
    { id: 'p1-m3', name: 'MEP Rough-in Complete', date: '2024-08-01', completed: false },
];

const p2_tasks: Task[] = [
  { id: 'p2-t1', title: 'Site Survey and Analysis', description: '', status: TaskStatus.Done, priority: TaskPriority.High, startDate: '2024-07-01', dueDate: '2024-07-05', assigneeIds: ['u4', 'u5'] },
  { id: 'p2-t2', title: 'Develop initial schematics', description: '', status: TaskStatus.InProgress, priority: TaskPriority.High, startDate: '2024-07-06', dueDate: '2024-07-20', assigneeIds: ['u4'], dependencies: ['p2-t1'] },
  { id: 'p2-t3', title: 'Budget estimation', description: '', status: TaskStatus.ToDo, priority: TaskPriority.Medium, startDate: '2024-07-21', dueDate: '2024-07-30', assigneeIds: ['u1'] },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Downtown Revitalization',
    description: 'A complete overhaul of the mechanical, electrical, and plumbing systems for the 20-story historical Landmark Tower. Focus on energy efficiency and modernizing infrastructure.',
    status: ProjectStatus.Active,
    startDate: '2024-05-15',
    endDate: '2024-12-20',
    budget: 400000000, // 40 Cr
    spent: 96000000,    // 9.6 Cr
    teamMemberIds: ['u1', 'u2', 'u3', 'u4', 'u5'],
    milestones: p1_milestones,
    tasks: p1_tasks,
  },
  {
    id: 'p2',
    name: 'Suburban Office Park',
    description: 'New construction of a 5-building office park. This project involves planning and executing all MEP systems from the ground up, including central plant design.',
    status: ProjectStatus.Planning,
    startDate: '2024-07-01',
    endDate: '2025-08-31',
    budget: 1000000000, // 100 Cr
    spent: 4000000,       // 40 L
    teamMemberIds: ['u1', 'u2', 'u4'],
    milestones: [],
    tasks: p2_tasks,
  },
  {
    id: 'p3',
    name: 'Hospital Wing Expansion',
    description: 'MEP fit-out for a new 50-bed hospital wing, including specialized systems for operating rooms and patient care units. Requires adherence to strict healthcare codes.',
    status: ProjectStatus.OnHold,
    startDate: '2024-06-01',
    endDate: '2025-02-28',
    budget: 640000000, // 64 Cr
    spent: 20000000,   // 2 Cr
    teamMemberIds: ['u1', 'u3', 'u5'],
    milestones: [],
    tasks: [],
  },
  {
    id: 'p4',
    name: 'Retail Center HVAC Upgrade',
    description: 'Completed project to replace 50 aging rooftop HVAC units across a large retail shopping center. Project was completed ahead of schedule and under budget.',
    status: ProjectStatus.Completed,
    startDate: '2023-09-01',
    endDate: '2024-04-15',
    budget: 176000000, // 17.6 Cr
    spent: 172000000,  // 17.2 Cr
    teamMemberIds: ['u1', 'u2', 'u3'],
    milestones: [],
    tasks: [],
  },
];