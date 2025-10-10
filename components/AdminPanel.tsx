import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile, UserRole, Project, ProjectStatus, Page } from '../types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';

interface AdminPanelProps {
  currentUserProfile: Profile | null;
  navigateTo: (page: Page, projectId?: number) => void;
}

const statusColors: { [key: string]: string } = {
  [ProjectStatus.Active]: 'bg-status-blue text-white',
  [ProjectStatus.Planning]: 'bg-status-yellow text-neutral-dark',
  [ProjectStatus.Completed]: 'bg-status-green text-white',
  [ProjectStatus.OnHold]: 'bg-status-red text-white',
};

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <Card className="text-center">
        <p className="text-sm text-neutral-medium">{title}</p>
        <p className="text-3xl font-bold text-neutral-dark">{value}</p>
    </Card>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUserProfile, navigateTo }) => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: usersData, error: usersError } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name', { ascending: true });

            if (usersError) throw usersError;
            setUsers(usersData);

            const { data: projectsData, error: projectError } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (projectError) throw projectError;
            setProjects(projectsData as Project[]);

        } catch (err: any) {
            setError('Failed to fetch admin data. Ensure you are logged in as an Admin.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        if (userId === currentUserProfile?.id) {
            alert("You cannot change your own role.");
            return;
        }
        
        const originalUsers = [...users];
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            alert('Failed to update role: ' + error.message);
            setUsers(originalUsers);
        }
    };

    if (currentUserProfile?.role !== UserRole.Admin) {
        return (
            <Card>
                <h2 className="text-2xl font-bold text-status-red text-center">Access Denied</h2>
                <p className="text-center text-neutral-medium mt-4">You do not have permission to view this page.</p>
            </Card>
        );
    }
    
    if (loading) {
        return <div>Loading admin panel...</div>;
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;
    }

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-neutral-dark">Admin Panel</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard title="Total Users" value={users.length} />
                <StatCard title="Total Projects" value={projects.length} />
            </div>

            <Card>
                <h3 className="text-xl font-semibold text-neutral-dark mb-4">All Projects</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-4 text-sm font-semibold text-neutral-medium">Project Name</th>
                                <th className="p-4 text-sm font-semibold text-neutral-medium">Status</th>
                                <th className="p-4 text-sm font-semibold text-neutral-medium">Budget</th>
                                <th className="p-4 text-sm font-semibold text-neutral-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => (
                                <tr key={project.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium text-neutral-dark">{project.name}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[project.status]}`}>{project.status}</span>
                                    </td>
                                    <td className="p-4 text-neutral-medium">₹{(project.budget || 0).toLocaleString()}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => navigateTo(Page.ProjectDetail, project.id)}
                                            className="text-brand-primary hover:underline text-sm font-semibold"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card>
                <h3 className="text-xl font-semibold text-neutral-dark mb-4">User Management</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-4 text-sm font-semibold text-neutral-medium">User</th>
                                <th className="p-4 text-sm font-semibold text-neutral-medium">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <Avatar profile={user} size="lg" />
                                            <div>
                                                <p className="font-semibold text-neutral-dark">{user.full_name}</p>
                                                <p className="text-sm text-neutral-medium">{user.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={user.role || ''}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                            disabled={user.id === currentUserProfile?.id}
                                            className="w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-primary focus:border-brand-primary disabled:bg-gray-100"
                                            aria-label={`Role for ${user.full_name}`}
                                        >
                                            {Object.values(UserRole).map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminPanel;