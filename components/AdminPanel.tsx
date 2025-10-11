
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Profile, UserRole, Page } from '../types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';

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
        return <div className="text-center p-8 text-red-500">Access Denied. You must be an administrator to view this page.</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-neutral-dark">Admin Panel</h2>

            <Card>
                <h3 className="text-xl font-semibold text-neutral-darkest mb-4">Create New User</h3>
                {createError && <p className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">{createError}</p>}
                {createSuccess && <p className="p-3 mb-4 bg-green-100 text-green-700 rounded-md">{createSuccess}</p>}
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-neutral-medium">Full Name</label>
                            <input type="text" id="fullName" value={newFullName} onChange={e => setNewFullName(e.target.value)} required className="mt-1 block w-full form-input" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-medium">Email</label>
                            <input type="email" id="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="mt-1 block w-full form-input" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-medium">Password</label>
                            <input type="password" id="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full form-input" placeholder="Min. 6 characters" />
                        </div>
                        <div>
                             <label htmlFor="role" className="block text-sm font-medium text-neutral-medium">Role</label>
                             <select id="role" value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} required className="mt-1 block w-full form-select">
                                {Object.values(UserRole).map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                             </select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={isCreating} className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50">
                            {isCreating ? 'Creating User...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </Card>

            <Card>
                <h3 className="text-xl font-semibold text-neutral-darkest mb-4">Manage User Roles</h3>
                {loading ? <p>Loading users...</p> : 
                <>
                {error && <p className="p-3 bg-red-100 text-red-700 rounded-md">{error}</p>}
                {success && <p className="p-3 bg-green-100 text-green-700 rounded-md">{success}</p>}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-neutral-medium">User</th>
                                <th className="p-4 text-sm font-semibold text-neutral-medium">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map(profile => (
                                <tr key={profile.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <Avatar profile={profile} size="md" />
                                            <div>
                                                <p className="font-semibold text-neutral-dark">{profile.full_name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={profile.role || ''}
                                            onChange={(e) => handleRoleChange(profile.id, e.target.value as UserRole)}
                                            className="form-select w-full max-w-xs border-gray-300 rounded-md shadow-sm"
                                            disabled={profile.id === currentUserProfile?.id}
                                        >
                                            {Object.values(UserRole).map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                        {profile.id === currentUserProfile?.id && <p className="text-xs text-neutral-medium mt-1">Cannot change your own role.</p>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end p-4 border-t">
                    <button 
                        onClick={handleUpdateRoles}
                        className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-dark transition-colors"
                    >
                        Save Role Changes
                    </button>
                </div>
                </>
                }
            </Card>
        </div>
    );
};

export default AdminPanel;
