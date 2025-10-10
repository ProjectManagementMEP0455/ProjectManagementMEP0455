import React, { useState, FormEvent, useEffect } from 'react';
import { Project, Profile } from '../types';
import { supabase } from '../lib/supabaseClient';
import Avatar from './ui/Avatar';

type NewProjectFormData = Omit<Project, 'id' | 'status' | 'spent' | 'milestones' | 'tasks' | 'teamMembers' | 'created_at' | 'project_team_members' | 'created_by'> & {
  teamMemberIds: string[];
};

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (projectData: NewProjectFormData) => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onAddProject }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(0);
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
        setLoadingUsers(true);
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error("Error fetching users:", error);
        } else {
            setAllUsers(data);
        }
        setLoadingUsers(false);
    };

    if (isOpen) {
      // Reset form state
      const today = new Date().toISOString().split('T')[0];
      setName('');
      setDescription('');
      setStartDate(today);
      setEndDate('');
      setBudget(0);
      setSelectedTeamMemberIds([]);
      fetchUsers();
    }
  }, [isOpen]);

  const handleTeamMemberToggle = (userId: string) => {
    setSelectedTeamMemberIds(prev =>
        prev.includes(userId)
            ? prev.filter(id => id !== userId)
            : [...prev, userId]
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || budget <= 0) {
      alert('Please fill out all fields with valid values.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        alert('End date cannot be earlier than start date.');
        return;
    }

    onAddProject({
      name,
      description,
      start_date: startDate,
      end_date: endDate,
      budget,
      teamMemberIds: selectedTeamMemberIds,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-neutral-dark mb-6">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="mt-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto p-2">
                {loadingUsers ? <p>Loading users...</p> : allUsers.map(user => (
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
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-dark bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-dark transition-colors">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;