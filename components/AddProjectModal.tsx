import React, { useState, FormEvent, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import { MOCK_USERS } from '../constants';

// Use Omit to create a type for the new project data from the form
type NewProjectData = Omit<Project, 'id' | 'status' | 'spent' | 'milestones' | 'tasks'>;

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (projectData: NewProjectData) => void;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onAddProject }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [teamMemberIds, setTeamMemberIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      const today = new Date().toISOString().split('T')[0];
      setName('');
      setDescription('');
      setTeamMemberIds([]);
      setStartDate(today);
      setEndDate('');
      setBudget(0);
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || !budget) {
      alert('Please fill out all fields.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        alert('End date cannot be earlier than start date.');
        return;
    }

    onAddProject({
      name,
      description,
      startDate,
      endDate,
      budget,
      teamMemberIds,
    });
  };
  
  const handleTeamMemberChange = (userId: string) => {
    setTeamMemberIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
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
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-medium">Assign Team Members</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 border p-2 rounded-md max-h-32 overflow-y-auto">
              {MOCK_USERS.map(user => (
                <div key={user.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`project-user-${user.id}`}
                    checked={teamMemberIds.includes(user.id)}
                    onChange={() => handleTeamMemberChange(user.id)}
                    className="h-4 w-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <label htmlFor={`project-user-${user.id}`} className="ml-3 text-sm text-neutral-dark">{user.name}</label>
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