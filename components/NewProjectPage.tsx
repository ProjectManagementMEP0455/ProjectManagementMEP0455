import React, { useState, FormEvent, useEffect } from 'react';
import { Profile } from '../types';
import { supabase } from '../lib/supabaseClient';
import Avatar from './ui/Avatar';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';

type NewProjectFormData = {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
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

    if (!name || !startDate || !endDate) {
      alert('Please fill out all required fields.');
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
      teamMemberIds: selectedTeamMemberIds,
    });
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-foreground mb-6">Create a New Project</h2>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-muted-foreground">Project Name</label>
            <Input type="text" id="projectName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="projectDescription" className="block text-sm font-medium text-muted-foreground">Description</label>
            <Textarea id="projectDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="projectStartDate" className="block text-sm font-medium text-muted-foreground">Start Date</label>
              <Input type="date" id="projectStartDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="projectEndDate" className="block text-sm font-medium text-muted-foreground">End Date</label>
              <Input type="date" id="projectEndDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground">Assign Team Members</label>
            <div className="mt-2 border border-border rounded-md max-h-52 overflow-y-auto p-2">
                {loadingUsers ? <p className="text-center p-4">Loading users...</p> : allUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                        <div className="flex items-center space-x-3">
                            <Avatar profile={user} size="md"/>
                            <div>
                                <p className="font-semibold">{user.full_name}</p>
                                <p className="text-xs text-muted-foreground">{user.role}</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            className="h-5 w-5 rounded bg-input border-border text-primary focus:ring-primary"
                            checked={selectedTeamMemberIds.includes(user.id)}
                            onChange={() => handleTeamMemberToggle(user.id)}
                        />
                    </div>
                ))}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting} variant="primary" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>}>
              {isSubmitting ? 'Creating Project...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewProjectPage;