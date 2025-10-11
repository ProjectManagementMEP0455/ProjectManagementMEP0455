
import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        if (currentUserProfile?.role !== UserRole.Admin) {
            // Redirect non-admins away
            navigateTo(Page.Dashboard);
            return;
        }

        const fetchProfiles = async () => {
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
        };

        fetchProfiles();
    }, [currentUserProfile, navigateTo]);

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

    if (loading) {
        return <div className="text-center p-8">Loading users...</div>;
    }
    
    if (currentUserProfile?.role !== UserRole.Admin) {
        return <div className="text-center p-8 text-red-500">Access Denied. You must be an administrator to view this page.</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-neutral-dark">Admin Panel: User Management</h2>
            {error && <p className="p-3 bg-red-100 text-red-700 rounded-md">{error}</p>}
            {success && <p className="p-3 bg-green-100 text-green-700 rounded-md">{success}</p>}
            <Card>
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
                                                {/* In a real app, you might show the user's email too */}
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
                        Save Changes
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default AdminPanel;
