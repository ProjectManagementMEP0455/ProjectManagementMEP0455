
import React, { useState, FormEvent } from 'react';
// FIX: Import MilestoneInsert to be used in updated prop types.
import { Milestone, Profile, UserRole, MilestoneInsert } from '../types';
import Card from './ui/Card';

interface MilestonesViewProps {
    milestones: Milestone[];
    userProfile: Profile | null;
    // FIX: Update prop signature to match the handler in ProjectDetail. It now expects data without project_id.
    onAddMilestone: (milestoneData: Omit<MilestoneInsert, 'project_id'>) => Promise<void>;
}

// FIX: Update onAdd prop signature to not require project_id, as the parent component supplies it.
const AddMilestoneForm: React.FC<{ onAdd: (data: Omit<MilestoneInsert, 'project_id'>) => Promise<void> }> = ({ onAdd }) => {
    const [name, setName] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!name || !dueDate) {
            alert('Please provide a name and due date for the milestone.');
            return;
        }
        // FIX: The call now correctly matches the updated onAdd signature.
        onAdd({ name, due_date: dueDate }).then(() => {
            setName('');
            setDueDate('');
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 p-4 border-t border-gray-200 flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-grow w-full">
                <label htmlFor="milestoneName" className="block text-sm font-medium text-neutral-medium">New Milestone Name</label>
                <input
                    type="text"
                    id="milestoneName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    placeholder="e.g., Finalize Blueprints"
                    required
                />
            </div>
            <div className="w-full sm:w-auto">
                <label htmlFor="milestoneDueDate" className="block text-sm font-medium text-neutral-medium">Due Date</label>
                <input
                    type="date"
                    id="milestoneDueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    required
                />
            </div>
            <button type="submit" className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-dark transition-colors">
                Add Milestone
            </button>
        </form>
    );
};

const MilestonesView: React.FC<MilestonesViewProps> = ({ milestones, userProfile, onAddMilestone }) => {
    
    const canManageMilestones = userProfile && [
        UserRole.ProjectDirector,
        UserRole.ProjectManager,
        UserRole.AssistantProjectManager
    ].includes(userProfile.role);

    return (
        <Card>
            <h3 className="text-xl font-semibold text-neutral-dark mb-6">Project Milestones</h3>
            
            {(!milestones || milestones.length === 0) && (
                <p className="text-neutral-medium">No milestones have been defined for this project yet.</p>
            )}

            {milestones && milestones.length > 0 && (
                <div className="relative border-l-2 border-brand-primary pl-8 space-y-10">
                    {milestones.map((milestone) => (
                        <div key={milestone.id} className="relative">
                            <div className={`absolute -left-[42px] top-1 w-5 h-5 rounded-full flex items-center justify-center ${milestone.completed ? 'bg-status-green' : 'bg-white border-2 border-brand-primary'}`}>
                               {milestone.completed && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            </div>
                            <p className={`font-semibold text-lg ${milestone.completed ? 'text-neutral-dark' : 'text-brand-primary'}`}>{milestone.name}</p>
                            <p className="text-neutral-medium">Due: {new Date(milestone.due_date).toLocaleDateString()}</p>
                            <p className={`text-sm font-bold ${milestone.completed ? 'text-status-green' : 'text-status-yellow'}`}>
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
