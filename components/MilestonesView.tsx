import React from 'react';
import { Milestone } from '../types';
import Card from './ui/Card';

interface MilestonesViewProps {
    milestones: Milestone[];
}

const MilestonesView: React.FC<MilestonesViewProps> = ({ milestones }) => {
    if (milestones.length === 0) {
        return (
            <Card>
                <h3 className="text-xl font-semibold text-neutral-dark mb-4">Project Milestones</h3>
                <p className="text-neutral-medium">No milestones have been defined for this project yet.</p>
            </Card>
        );
    }
    
    return (
        <Card>
            <h3 className="text-xl font-semibold text-neutral-dark mb-6">Project Milestones</h3>
            <div className="relative border-l-2 border-brand-primary pl-8 space-y-10">
                {milestones.map((milestone) => (
                    <div key={milestone.id} className="relative">
                        <div className={`absolute -left-[42px] top-1 w-5 h-5 rounded-full flex items-center justify-center ${milestone.completed ? 'bg-status-green' : 'bg-white border-2 border-brand-primary'}`}>
                           {milestone.completed && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                        </div>
                        <p className={`font-semibold text-lg ${milestone.completed ? 'text-neutral-dark' : 'text-brand-primary'}`}>{milestone.name}</p>
                        <p className="text-neutral-medium">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                        <p className={`text-sm font-bold ${milestone.completed ? 'text-status-green' : 'text-status-yellow'}`}>
                            {milestone.completed ? 'Completed' : 'Pending'}
                        </p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default MilestonesView;
