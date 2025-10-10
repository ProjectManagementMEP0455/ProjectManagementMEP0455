

import React from 'react';
import { Project, Page, ProjectStatus } from '../types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import RiskAnalysis from './RiskAnalysis';
// FIX: Import CartesianGrid from recharts to resolve 'Cannot find name' error.
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface DashboardProps {
  navigateTo: (page: Page, projectId?: number) => void;
  projects: Project[];
}

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <Card>
        <p className="text-sm text-neutral-medium">{title}</p>
        <p className="text-2xl font-bold text-neutral-dark">{value}</p>
    </Card>
);

const statusColors: { [key in ProjectStatus]: string } = {
  [ProjectStatus.Active]: '#0065FF',
  [ProjectStatus.Planning]: '#FFAB00',
  [ProjectStatus.Completed]: '#36B37E',
  [ProjectStatus.OnHold]: '#FF5630',
};

const Dashboard: React.FC<DashboardProps> = ({ navigateTo, projects }) => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === ProjectStatus.Active).length;
    const completedProjects = projects.filter(p => p.status === ProjectStatus.Completed).length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const recentProjects = projects.slice(0, 5);

    const projectStatusData = Object.values(ProjectStatus).map(status => ({
        name: status,
        value: projects.filter(p => p.status === status).length,
    })).filter(item => item.value > 0);

    const budgetData = projects.map(p => ({
        name: p.name,
        Budget: p.budget || 0,
        Spent: p.spent || 0,
    }));

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-bold text-neutral-dark">Dashboard</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Projects" value={totalProjects} />
                <StatCard title="Active Projects" value={activeProjects} />
                <StatCard title="Completed Projects" value={completedProjects} />
                <StatCard title="Total Budget" value={`₹${(totalBudget / 100000).toFixed(2)}L`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <h3 className="text-xl font-semibold text-neutral-dark mb-4">Projects by Status</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={projectStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {projectStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={statusColors[entry.name as ProjectStatus]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="lg:col-span-2">
                    <h3 className="text-xl font-semibold text-neutral-dark mb-4">Budget vs. Spent</h3>
                     <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={budgetData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-10} textAnchor="end" height={50} />
                                <YAxis tickFormatter={(value) => `₹${Number(value) / 100000}L`} />
                                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="Budget" fill="#4C9AFF" />
                                <Bar dataKey="Spent" fill="#0052CC" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
             
            <RiskAnalysis projects={projects} />
            
            <Card>
                <h3 className="text-xl font-semibold text-neutral-dark mb-4">Recent Projects</h3>
                <div className="space-y-4">
                    {recentProjects.map(project => (
                        <div key={project.id} onClick={() => navigateTo(Page.ProjectDetail, project.id)} className="p-4 rounded-lg hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-brand-primary">{project.name}</p>
                                <p className="text-sm text-neutral-medium">End Date: {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div className="flex -space-x-2">
                                {project.teamMembers?.slice(0,3).map(member => (
                                    <Avatar key={member.id} profile={member} size="md" />
                                ))}
                            </div>
                        </div>
                    ))}
                    {recentProjects.length === 0 && <p className="text-neutral-medium">No recent projects.</p>}
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;