import React from 'react';
import { Project, User, ProjectStatus, TaskStatus, TaskPriority, UserRole } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Johnson', role: UserRole.ProjectManager, avatarUrl: 'https://picsum.photos/seed/u1/40/40' },
  { id: 'u2', name: 'Bob Williams', role: UserRole.Engineer, avatarUrl: 'https://picsum.photos/seed/u2/40/40' },
  { id: 'u3', name: 'Charlie Brown', role: UserRole.Engineer, avatarUrl: 'https://picsum.photos/seed/u3/40/40' },
  { id: 'u4', name: 'Diana Miller', role: UserRole.Subcontractor, avatarUrl: 'https://picsum.photos/seed/u4/40/40' },
  { id: 'u5', name: 'Ethan Davis', role: UserRole.Admin, avatarUrl: 'https://picsum.photos/seed/u5/40/40' },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Downtown Tower HVAC Overhaul',
    description: 'Complete overhaul of the HVAC system for the Downtown Financial Tower, including chiller replacement and ductwork upgrades.',
    startDate: '2024-01-15',
    endDate: '2024-09-30',
    budget: 5000000,
    spent: 3250000,
    status: ProjectStatus.Active,
    teamMemberIds: ['u1', 'u2', 'u3'],
    milestones: [
        { id: 'm1', name: 'Design Approval', date: '2024-02-15', completed: true },
        { id: 'm2', name: 'Chiller Procurement', date: '2024-04-01', completed: true },
        { id: 'm3', name: 'Floors 1-10 Installation', date: '2024-07-01', completed: false },
        { id: 'm4', name: 'System Commissioning', date: '2024-09-15', completed: false },
    ],
    tasks: [
      { id: 't1', title: 'Site Survey & Assessment', description: '', status: TaskStatus.Done, priority: TaskPriority.Critical, startDate: '2024-01-15', dueDate: '2024-01-30', assigneeIds: ['u2'] },
      { id: 't2', title: 'Submit Permit Applications', description: '', status: TaskStatus.Done, priority: TaskPriority.High, startDate: '2024-01-31', dueDate: '2024-02-10', assigneeIds: ['u1'], dependencies: ['t1'] },
      { id: 't3', title: 'Install new rooftop chiller unit', description: '', status: TaskStatus.InProgress, priority: TaskPriority.Critical, startDate: '2024-05-20', dueDate: '2024-06-15', assigneeIds: ['u2', 'u3'], dependencies: ['t2'] },
      { id: 't4', title: 'Upgrade electrical panels on floors 5-8', description: '', status: TaskStatus.InProgress, priority: TaskPriority.High, startDate: '2024-06-16', dueDate: '2024-07-20', assigneeIds: ['u3'], dependencies: ['t3'] },
      { id: 't5', title: 'Client progress review meeting', description: '', status: TaskStatus.ToDo, priority: TaskPriority.Medium, startDate: '2024-07-22', dueDate: '2024-08-01', assigneeIds: ['u1'] },
      { id: 't6', title: 'Finalize subcontractor plumbing work', description: '', status: TaskStatus.InReview, priority: TaskPriority.High, startDate: '2024-07-10', dueDate: '2024-07-25', assigneeIds: ['u4'] },
    ]
  },
  {
    id: 'p2',
    name: 'Greenfield Hospital Electrical System',
    description: 'Full electrical system design and installation for a new 200-bed hospital, including backup generators and low-voltage systems.',
    startDate: '2024-03-01',
    endDate: '2025-05-30',
    budget: 12000000,
    spent: 4500000,
    status: ProjectStatus.Active,
    teamMemberIds: ['u1', 'u3', 'u4'],
     milestones: [
        { id: 'm5', name: 'Rough-in Complete', date: '2024-09-01', completed: false },
        { id: 'm6', name: 'Generator Installation', date: '2024-11-15', completed: false },
    ],
    tasks: [
       { id: 't7', title: 'Coordinate with general contractor', description: '', status: TaskStatus.InProgress, priority: TaskPriority.High, startDate: '2024-07-01', dueDate: '2024-08-15', assigneeIds: ['u1'] },
       { id: 't8', title: 'Install main switchgear', description: '', status: TaskStatus.ToDo, priority: TaskPriority.Critical, startDate: '2024-08-16', dueDate: '2024-09-01', assigneeIds: ['u3'], dependencies: ['t7'] },
    ]
  },
  {
    id: 'p3',
    name: 'Suburban Mall Plumbing Retrofit',
    description: 'Retrofit all public restrooms and food court plumbing to meet new water efficiency standards.',
    startDate: '2024-05-10',
    endDate: '2024-08-20',
    budget: 750000,
    spent: 765000,
    status: ProjectStatus.Completed,
    teamMemberIds: ['u2', 'u4'],
    milestones: [],
    tasks: []
  },
   {
    id: 'p4',
    name: 'University Science Lab Ventilation',
    description: 'Design and install specialized ventilation systems for new chemistry and biology labs.',
    startDate: '2024-08-01',
    endDate: '2024-12-15',
    budget: 2200000,
    spent: 150000,
    status: ProjectStatus.Planning,
    teamMemberIds: ['u1', 'u2'],
    milestones: [],
    tasks: []
  }
];

export const ICONS = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    projects: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
    tasks: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
    settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    logout: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
    bell: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    chevronDown: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
    search: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    plus: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
};