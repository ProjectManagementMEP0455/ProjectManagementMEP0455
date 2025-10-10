
import React from 'react';
import { Project, Page, ProjectStatus } from '../types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';

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


const Dashboard: React.FC<DashboardProps> = ({ navigateTo, projects }) => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === ProjectStatus.Active).length;
    const completedProjects = projects.filter(p => p.status === ProjectStatus.Completed).length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const recentProjects = projects.slice(0, 5);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-neutral-dark">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Projects" value={totalProjects} />
                <StatCard title="Active Projects" value={activeProjects} />
                <StatCard title="Completed Projects" value={completedProjects} />
                <StatCard title="Total Budget" value={`₹${(totalBudget / 100000).toFixed(2)}L`} />
            </div>

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
