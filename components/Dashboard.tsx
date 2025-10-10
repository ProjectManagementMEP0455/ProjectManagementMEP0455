import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Card from './ui/Card';
import { MOCK_USERS } from '../constants';
import { Page, Project, ProjectStatus } from '../types';
import Avatar from './ui/Avatar';

interface DashboardProps {
  navigateTo: (page: Page, projectId?: string) => void;
  projects: Project[];
}

const formatCurrencyINR = (value: number) => {
  if (value >= 10000000) { // 1 Crore
      return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) { // 1 Lakh
      return `₹${(value / 100000).toFixed(2)} L`;
  }
  return `₹${new Intl.NumberFormat('en-IN').format(value)}`;
};

const Dashboard: React.FC<DashboardProps> = ({ navigateTo, projects }) => {
  const activeProjects = projects.filter(p => p.status === ProjectStatus.Active);
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);

  const projectStatusData = [
    { name: 'Active', value: projects.filter(p => p.status === 'Active').length, color: '#0065FF' },
    { name: 'Planning', value: projects.filter(p => p.status === 'Planning').length, color: '#FFAB00' },
    { name: 'Completed', value: projects.filter(p => p.status === 'Completed').length, color: '#36B37E' },
    { name: 'On Hold', value: projects.filter(p => p.status === 'On Hold').length, color: '#FF5630' },
  ];

  const budgetData = projects.map(p => ({
    name: p.name.split(' ')[0],
    budget: p.budget,
    spent: p.spent,
  }));
  
  const timelineData = [
    {name: 'Jan', tasks: 30, resources: 5},
    {name: 'Feb', tasks: 45, resources: 7},
    {name: 'Mar', tasks: 60, resources: 8},
    {name: 'Apr', tasks: 55, resources: 8},
    {name: 'May', tasks: 70, resources: 9},
    {name: 'Jun', tasks: 85, resources: 10},
];

 const downtownProject = projects.find(p => p.id === 'p1');

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-neutral-dark">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-neutral-medium">Active Projects</h3>
          <p className="text-3xl font-bold text-neutral-dark">{activeProjects.length}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-neutral-medium">Total Budget</h3>
          <p className="text-3xl font-bold text-neutral-dark">{formatCurrencyINR(totalBudget)}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-neutral-medium">Total Spent</h3>
          <p className="text-3xl font-bold text-neutral-dark">{formatCurrencyINR(totalSpent)}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-neutral-medium">On-Time Completion</h3>
          <p className="text-3xl font-bold text-status-green">92%</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-neutral-dark">Project Budget vs. Spending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatCurrencyINR(Number(value))} />
              <Tooltip formatter={(value) => `₹${new Intl.NumberFormat('en-IN').format(Number(value))}`}/>
              <Legend />
              <Bar dataKey="budget" fill="#4C9AFF" />
              <Bar dataKey="spent" fill="#0052CC" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-neutral-dark">Project Status Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={projectStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {projectStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
      
       <div className="grid grid-cols-1 gap-6">
            <Card>
                <h3 className="text-xl font-semibold mb-4 text-neutral-dark">Task & Resource Timeline</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="tasks" stroke="#0052CC" strokeWidth={2} name="Tasks Completed"/>
                        <Line type="monotone" dataKey="resources" stroke="#36B37E" strokeWidth={2} name="Resources Allocated"/>
                    </LineChart>
                </ResponsiveContainer>
            </Card>
        </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-xl font-semibold mb-4 text-neutral-dark">Recent Activity</h3>
        <ul className="space-y-4">
          <li className="flex items-center space-x-4">
            <Avatar user={MOCK_USERS[0]} />
            <div>
              <p className="text-neutral-dark">
                <span className="font-semibold">{MOCK_USERS[0].name}</span> updated task <span className="text-brand-primary font-medium">"Install new rooftop chiller unit"</span> in project {downtownProject ? <span className="text-brand-primary font-medium cursor-pointer" onClick={() => navigateTo(Page.ProjectDetail, downtownProject.id)}>{downtownProject.name}</span> : null}.
              </p>
              <p className="text-sm text-neutral-medium">2 hours ago</p>
            </div>
          </li>
          <li className="flex items-center space-x-4">
            <Avatar user={MOCK_USERS[1]} />
            <div>
              <p className="text-neutral-dark">
                <span className="font-semibold">{MOCK_USERS[1].name}</span> completed milestone <span className="text-status-green font-medium">"Design Approval"</span> on {downtownProject ? <span className="text-brand-primary font-medium cursor-pointer" onClick={() => navigateTo(Page.ProjectDetail, downtownProject.id)}>{downtownProject.name}</span> : null}.
              </p>
              <p className="text-sm text-neutral-medium">1 day ago</p>
            </div>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default Dashboard;