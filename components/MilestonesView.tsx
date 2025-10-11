import React, { useState, FormEvent } from 'react';
import { Milestone, Profile, UserRole, MilestoneInsert } from '../types';
import Card from './ui/Card';
import Button from './ui/Button';
import Input from './ui/Input';

interface MilestonesViewProps {
    milestones: Milestone[];
    userProfile: Profile | null;
    onAddMilestone: (milestoneData: Omit<MilestoneInsert, 'project_id'>) => Promise<void>;
}

const AddMilestoneForm: React.FC<{ onAdd: (data: Omit<MilestoneInsert, 'project_id'>) => Promise<void> }> = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name || !dueDate) {
            alert('Please provide a name and due date for the milestone.');
            return;
        }
        setIsSubmitting(true);
        await onAdd({ name, due_date: dueDate });
        setName('');
        setDueDate('');
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 p-4 border-t border-border flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-grow w-full">
                <label htmlFor="milestoneName" className="block text-sm font-medium text-muted-foreground">New Milestone Name</label>
                <Input
                    type="text"
                    id="milestoneName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Finalize Blueprints"
                    required
                />
            </div>
            <div className="w-full sm:w-auto">
                <label htmlFor="milestoneDueDate" className="block text-sm font-medium text-muted-foreground">Due Date</label>
                <Input
                    type="date"
                    id="milestoneDueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                />
            </div>
            <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Adding...' : 'Add Milestone'}
            </Button>
        </form>
    );
};

const MilestonesView: React.FC<MilestonesViewProps> = ({ milestones, userProfile, onAddMilestone }) => {
    
    const canManageMilestones = userProfile && [
        UserRole.Admin,
        UserRole.ProjectDirector,
        UserRole.ProjectManager,
        UserRole.AssistantProjectManager
    ].includes(userProfile.role);

    return (
        <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">Project Milestones</h3>
            
            {(!milestones || milestones.length === 0) && (
                <p className="text-muted-foreground">No milestones have been defined for this project yet.</p>
            )}

            {milestones && milestones.length > 0 && (
                <div className="relative border-l-2 border-primary/30 pl-8 space-y-10">
                    {milestones.map((milestone) => (
                        <div key={milestone.id} className="relative">
                            <div className={`absolute -left-[42px] top-1 w-5 h-5 rounded-full flex items-center justify-center ${milestone.completed ? 'bg-green-500' : 'bg-background border-2 border-primary'}`}>
                               {milestone.completed && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            </div>
                            <p className={`font-semibold text-lg ${milestone.completed ? 'text-muted-foreground line-through' : 'text-primary'}`}>{milestone.name}</p>
                            <p className="text-muted-foreground">Due: {new Date(milestone.due_date).toLocaleDateString()}</p>
                            <p className={`text-sm font-bold ${milestone.completed ? 'text-green-400' : 'text-yellow-400'}`}>
                                {milestone.completed ? 'Completed' : 'Pending'}
                            </p>
                        </div>
                    ))}
                </div>
            )}
            
            {canManageMilestones && <AddMilestoneForm onAdd={onAddMilestone} />}
        </Card>
    );
};

export default MilestonesView;