import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile, UserRole, Page } from '../types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import Button from './ui/Button';
import Input from './ui/Input';

interface AdminPanelProps {
    currentUserProfile: Profile | null;
    navigateTo: (page: Page) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ currentUserProfile, navigateTo }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [newFullName, setNewFullName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<UserRole>(UserRole.SiteEngineerTechnician);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');
    const [createSuccess, setCreateSuccess] = useState('');

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) {
            setError('Failed to fetch user profiles.');
            console.error(error);
        } else {
            setProfiles(data);
        }
        setLoading(false);
    }, []);


    useEffect(() => {
        if (currentUserProfile?.role !== UserRole.Admin) {
            navigateTo(Page.Dashboard);
            return;
        }
        fetchProfiles();
    }, [currentUserProfile, navigateTo, fetchProfiles]);

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p));
    };

    const handleUpdateRoles = async () => {
        setError('');
        setSuccess('');

        const updatePromises = profiles.map(profile =>
            supabase
                .from('profiles')
                .update({ role: profile.role })
                .eq('id', profile.id)
        );

        const results = await Promise.all(updatePromises);
        const failedUpdates = results.filter(res => res.error);

        if (failedUpdates.length > 0) {
            setError(`Failed to update ${failedUpdates.length} profile(s). Please check console for details.`);
            console.error(failedUpdates.map(res => res.error));
        } else {
            setSuccess('All user roles updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        }
    };
    
    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setCreateError("Password must be at least 6 characters long.");
            return;
        }
        setIsCreating(true);
        setCreateError('');
        setCreateSuccess('');

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: newEmail,
            password: newPassword,
            options: {
                data: {
                    full_name: newFullName,
                }
            }
        });

        if (signUpError) {
            setCreateError(signUpError.message);
            setIsCreating(false);
            return;
        }

        if (signUpData.user) {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', signUpData.user.id);

            if (updateError) {
                setCreateError(`User created, but failed to set role: ${updateError.message}. Please set it manually.`);
            } else {
                setCreateSuccess(`Successfully created user ${newFullName}. A confirmation email has been sent to ${newEmail}.`);
                setNewFullName('');
                setNewEmail('');
                setNewPassword('');
                setNewRole(UserRole.SiteEngineerTechnician);
                await fetchProfiles();
            }
        } else {
             setCreateError("An unknown error occurred. The user may already exist or the sign-up process failed.");
        }
        setIsCreating(false);
    };

    if (currentUserProfile?.role !== UserRole.Admin) {
        return <div className="text-center p-8 text-destructive">Access Denied. You must be an administrator to view this page.</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">Admin Panel</h2>

            <Card className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Create New User</h3>
                {createError && <p className="p-3 mb-4 bg-red-500/20 text-red-300 rounded-md">{createError}</p>}
                {createSuccess && <p className="p-3 mb-4 bg-green-500/20 text-green-300 rounded-md">{createSuccess}</p>}
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-muted-foreground">Full Name</label>
                            <Input type="text" id="fullName" value={newFullName} onChange={e => setNewFullName(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">Email</label>
                            <Input type="email" id="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">Password</label>
                            <Input type="password" id="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="Min. 6 characters" />
                        </div>
                        <div>
                             <label htmlFor="role" className="block text-sm font-medium text-muted-foreground">Role</label>
                             <select id="role" value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} required className="mt-1 block w-full bg-input border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring">
                                {Object.values(UserRole).map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                             </select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={isCreating} variant="primary">
                            {isCreating ? 'Creating User...' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </Card>

            <Card className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Manage User Roles</h3>
                {loading ? <p>Loading users...</p> : 
                <>
                {error && <p className="p-3 bg-red-500/20 text-red-300 rounded-md">{error}</p>}
                {success && <p className="p-3 bg-green-500/20 text-green-300 rounded-md">{success}</p>}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-border">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-muted-foreground">User</th>
                                <th className="p-4 text-sm font-semibold text-muted-foreground">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map(profile => (
                                <tr key={profile.id} className="border-b border-border last:border-0 hover:bg-muted">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <Avatar profile={profile} size="md" />
                                            <div>
                                                <p className="font-semibold text-foreground">{profile.full_name}</p>
                                                <p className="text-xs text-muted-foreground">{profile.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={profile.role || ''}
                                            onChange={(e) => handleRoleChange(profile.id, e.target.value as UserRole)}
                                            className="w-full max-w-xs bg-input border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
                                            disabled={profile.id === currentUserProfile?.id}
                                        >
                                            {Object.values(UserRole).map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                        {profile.id === currentUserProfile?.id && <p className="text-xs text-muted-foreground mt-1">Cannot change your own role.</p>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end p-4 mt-4">
                    <Button
                        onClick={handleUpdateRoles}
                        variant="primary"
                    >
                        Save Role Changes
                    </Button>
                </div>
                </>
                }
            </Card>
        </div>
    );
};

export default AdminPanel;