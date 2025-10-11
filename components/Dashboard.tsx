import React from 'react';
import { Project, Page, ProjectStatus, Task, TaskStatus } from '../types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import RiskAnalysis from './RiskAnalysis';
import { useTheme } from '../App';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

interface DashboardProps {
  navigateTo: (page: Page, projectId?: number) => void;
  projects: Project[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card className="flex items-center p-4">
        <div className="p-3 rounded-full bg-primary/20 text-primary mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
    </Card>
);

const statusThemeColors: { [key in ProjectStatus]: { light: string; dark: string } } = {
  [ProjectStatus.Active]: { light: '#0065FF', dark: '#4C9AFF' },
  [ProjectStatus.Planning]: { light: '#FFAB00', dark: '#FFC400' },
  [ProjectStatus.Completed]: { light: '#36B37E', dark: '#57D9A3' },
  [ProjectStatus.OnHold]: { light: '#FF5630', dark: '#FF7452' },
};


const LongPendingTasks: React.FC<{ projects: Project[], navigateTo: (page: Page, projectId?: number) => void }> = ({ projects, navigateTo }) => {
    const allTasks = projects.flatMap(p => p.tasks.map(t => ({...t, projectName: p.name, projectId: p.id})));
    const today = new Date();
    
    const overdueTasks = allTasks
        .filter(t => t.due_date && new Date(t.due_date) < today && t.status !== TaskStatus.Done)
        .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

    return (
        <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Long Pending Tasks</h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {overdueTasks.length > 0 ? overdueTasks.slice(0, 7).map(task => {
                    const overdueDays = Math.floor((today.getTime() - new Date(task.due_date!).getTime()) / (1000 * 3600 * 24));
                    return (
                        <div key={task.id} onClick={() => navigateTo(Page.ProjectDetail, task.projectId)} className="p-3 rounded-lg hover:bg-muted cursor-pointer">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-foreground">{task.name}</p>
                                    <p className="text-xs text-muted-foreground">{task.projectName}</p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                     <p className="font-bold text-destructive">{overdueDays}d overdue</p>
                                     <p className="text-xs text-muted-foreground">Due: {new Date(task.due_date!).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    );
                }) : <p className="text-muted-foreground text-center py-8">No overdue tasks. Great job!</p>}
            </div>
        </Card>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ navigateTo, projects }) => {
    const { theme } = useTheme();
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === ProjectStatus.Active).length;
    const completedProjects = projects.filter(p => p.status === ProjectStatus.Completed).length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const recentProjects = projects.slice(0, 5);

    const projectStatusData = Object.values(ProjectStatus).map(status => ({
        name: status,
        value: projects.filter(p => p.status === status).length,
    })).filter(item => item.value > 0);

    const budgetData = projects.filter(p => (p.budget || 0) > 0).slice(0, 10).map(p => ({
        name: p.name.length > 15 ? `${p.name.substring(0, 15)}...` : p.name,
        Budget: p.budget || 0,
        Spent: p.spent || 0,
    }));
    
    const tickColor = theme === 'dark' ? '#A1A1AA' : '#52525B';

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Projects" value={totalProjects} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" /></svg>} />
                <StatCard title="Active Projects" value={activeProjects} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
                <StatCard title="Completed" value={completedProjects} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Total Budget" value={`₹${(totalBudget / 100000).toFixed(2)}L`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LongPendingTasks projects={projects} navigateTo={navigateTo} />
                <Card className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Recent Projects</h3>
                    <div className="space-y-2">
                        {recentProjects.map(project => (
                            <div key={project.id} onClick={() => navigateTo(Page.ProjectDetail, project.id)} className="p-3 rounded-lg hover:bg-muted cursor-pointer flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-primary">{project.name}</p>
                                    <p className="text-sm text-muted-foreground">End Date: {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div className="flex -space-x-2">
                                    {project.teamMembers?.slice(0,3).map(member => (
                                        <Avatar key={member.id} profile={member} size="md" />
                                    ))}
                                </div>
                            </div>
                        ))}
                        {recentProjects.length === 0 && <p className="text-muted-foreground">No recent projects.</p>}
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Projects by Status</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={projectStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                    {projectStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={statusThemeColors[entry.name as ProjectStatus][theme]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="lg:col-span-2 p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Budget vs. Spent</h3>
                     <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={budgetData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} interval={0} angle={-20} textAnchor="end" height={60} />
                                <YAxis tickFormatter={(value) => `₹${Number(value) / 100000}L`} tick={{ fontSize: 12, fill: tickColor }} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} cursor={{fill: 'hsla(var(--primary), 0.1)'}} />
                                <Legend wrapperStyle={{ color: tickColor }}/>
                                <Bar dataKey="Budget" fill={theme === 'dark' ? '#4C9AFF' : '#A5C8FF'} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Spent" fill={theme === 'dark' ? '#0052CC' : '#0065FF'} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
             
            <RiskAnalysis projects={projects} />
        </div>
    );
};

export default Dashboard;