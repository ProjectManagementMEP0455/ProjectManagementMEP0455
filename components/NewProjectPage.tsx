
import React, { useState, FormEvent, useEffect } from 'react';
import { Profile } from '../types';
import { supabase } from '../lib/supabaseClient';
import Avatar from './ui/Avatar';
import Card from './ui/Card';

type NewProjectFormData = {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  budget: number;
  teamMemberIds: string[];
};

interface NewProjectPageProps {
  onAddProject: (projectData: NewProjectFormData) => Promise<void>;
}

const NewProjectPage: React.FC<NewProjectPageProps> = ({ onAddProject }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(0);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
        setLoadingUsers(true);
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error("Error fetching users:", error);
            alert("Could not load users for team selection.");
        } else {
            setAllUsers(data);
        }
        setLoadingUsers(false);
    };

    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    fetchUsers();
  }, []);

  const handleTeamMemberToggle = (userId: string) => {
    setSelectedTeamMemberIds(prev =>
        prev.includes(userId)
            ? prev.filter(id => id !== userId)
            : [...prev, userId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!name || !startDate || !endDate || budget <= 0) {
      alert('Please fill out all fields with valid values.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        alert('End date cannot be earlier than start date.');
        return;
    }
    
    setIsSubmitting(true);
    await onAddProject({
      name,
      description,
      start_date: startDate,
      end_date: endDate,
      budget,
      teamMemberIds: selectedTeamMemberIds,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-neutral-dark mb-6">Create a New Project</h2>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-neutral-medium">Project Name</label>
            <input
              type="text"
              id="projectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="projectDescription" className="block text-sm font-medium text-neutral-medium">Description</label>
            <textarea
              id="projectDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="projectStartDate" className="block text-sm font-medium text-neutral-medium">Start Date</label>
              <input
                type="date"
                id="projectStartDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="projectEndDate" className="block text-sm font-medium text-neutral-medium">End Date</label>
              <input
                type="date"
                id="projectEndDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
          </div>
           <div>
            <label htmlFor="projectBudget" className="block text-sm font-medium text-neutral-medium">Budget (₹)</label>
            <input
              type="number"
              id="projectBudget"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-medium">Assign Team Members</label>
            <div className="mt-2 border border-gray-300 rounded-md max-h-52 overflow-y-auto p-2">
                {loadingUsers ? <p className="text-center p-4">Loading users...</p> : allUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                        <div className="flex items-center space-x-3">
                            <Avatar profile={user} size="md"/>
                            <div>
                                <p className="font-semibold">{user.full_name}</p>
                                <p className="text-xs text-neutral-medium">{user.role}</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded text-brand-primary focus:ring-brand-primary"
                            checked={selectedTeamMemberIds.includes(user.id)}
                            onChange={() => handleTeamMemberToggle(user.id)}
                        />
                    </div>
                ))}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" disabled={isSubmitting} className="px-6 py-3 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Creating Project...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewProjectPage;
