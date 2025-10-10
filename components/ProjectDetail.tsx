
import React, { useState } from 'react';
import { Project, Task, Profile, Milestone, MilestoneInsert } from '../types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import KanbanBoard from './KanbanBoard';
import GanttChart from './GanttChart';
import MilestonesView from './MilestonesView';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import { supabase } from '../lib/supabaseClient';
import RiskAnalysis from './RiskAnalysis';
import ResourceView from './ResourceView';
import ModelsView from './ModelsView';

interface ProjectDetailProps {
  project: Project;
  onProjectUpdate: (updatedProject: Project) => void;
  userProfile: Profile | null;
}

type Tab = 'tasks' | 'timeline' | 'milestones' | 'risks' | 'resources' | 'models';

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onProjectUpdate, userProfile }) => {
    const [activeTab, setActiveTab] = useState<Tab>('tasks');
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const teamMembers = project.teamMembers || [];
    
    const handleAddTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'project_id'>) => {
        const { data, error } = await supabase
            .from('tasks')
            .insert([{ ...taskData, project_id: project.id }])
            .select()
            .single();

        if (error) {
            alert('Error adding task: ' + error.message);
        } else if (data) {
            const updatedTasks = [...project.tasks, data as Task];
            const updatedProject = { ...project, tasks: updatedTasks };
            onProjectUpdate(updatedProject);
            setIsAddTaskModalOpen(false);
        }
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsEditTaskModalOpen(true);
    };

    const handleTaskUpdate = async (updatedTask: Task) => {
        const { data, error } = await supabase
            .from('tasks')
            .update({
                name: updatedTask.name,
                description: updatedTask.description,
                status: updatedTask.status,
                due_date: updatedTask.due_date,
                assignee_id: updatedTask.assignee_id,
                percent_complete: updatedTask.percent_complete
            })
            .eq('id', updatedTask.id)
            .select()
            .single();

        if (error) {
            alert('Error updating task: ' + error.message);
        } else if (data) {
            const updatedTasks = project.tasks.map(t => t.id === data.id ? data as Task : t);
            const updatedProject = { ...project, tasks: updatedTasks };
            onProjectUpdate(updatedProject);
            setIsEditTaskModalOpen(false);
            setSelectedTask(null);
        }
    };
    
    const handleAddMilestone = async (milestoneData: Omit<MilestoneInsert, 'project_id'>) => {
        const { data, error } = await supabase
            .from('milestones')
            .insert([{ ...milestoneData, project_id: project.id }])
            .select()
            .single();

        if (error) {
            alert('Error adding milestone: ' + error.message);
        } else if (data) {
            const updatedMilestones = [...project.milestones, data as Milestone];
            const updatedProject = { ...project, milestones: updatedMilestones };
            onProjectUpdate(updatedProject);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'tasks':
                return <KanbanBoard 
                            tasks={project.tasks} 
                            onTaskUpdate={() => {}} 
                            onEditTask={handleEditTask}
                            onAddTask={() => setIsAddTaskModalOpen(true)}
                            userProfile={userProfile}
                        />;
            case 'timeline':
                return <GanttChart 
                            tasks={project.tasks}
                            projectStartDate={project.start_date || ''}
                            projectEndDate={project.end_date || ''}
                        />;
            case 'milestones':
                return <MilestonesView 
                            milestones={project.milestones}
                            userProfile={userProfile}
                            onAddMilestone={handleAddMilestone}
                        />;
            case 'risks':
                return <RiskAnalysis project={project} />;
            case 'resources':
                return <ResourceView project={project} />;
            case 'models':
                return <ModelsView project={project} />;
            default:
                return null;
        }
    };
    
    const budget = project.budget || 0;
    const spent = project.spent || 0;
    const budgetProgress = budget > 0 ? (spent / budget) * 100 : 0;

    const tabs: {id: Tab, label: string}[] = [
        { id: 'tasks', label: 'Tasks' },
        { id: 'timeline', label: 'Timeline' },
        { id: 'milestones', label: 'Milestones' },
        { id: 'risks', label: 'Risk Analysis' },
        { id: 'resources', label: 'Resources' },
        { id: 'models', label: '3D Models' },
    ];

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row justify-between md:items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-neutral-dark">{project.name}</h2>
                        <p className="text-neutral-medium mt-2">{project.description}</p>
                        <div className="mt-4 flex items-center space-x-4 text-sm text-neutral-dark">
                            <span><strong>Start:</strong> {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</span>
                            <span><strong>End:</strong> {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800`}>{project.status}</span>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:text-right">
                         <p className="font-semibold text-neutral-dark">Team Members</p>
                         <div className="flex -space-x-2 mt-2 justify-end">
                            {teamMembers.map((profile) => <Avatar key={profile.id} profile={profile} size="md" />)}
                         </div>
                    </div>
                </div>
                 <div className="mt-6">
                    <div className="flex justify-between text-sm text-neutral-medium mb-1">
                        <span>Budget Utilization</span>
                        <span>{`₹${spent.toLocaleString()} / ₹${budget.toLocaleString()}`}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="bg-brand-primary h-4 rounded-full text-white text-xs flex items-center justify-center" style={{ width: `${budgetProgress}%` }}>
                           {budgetProgress.toFixed(0)}%
                        </div>
                    </div>
                </div>
            </Card>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                         <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-neutral-medium hover:text-neutral-dark hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
                {renderTabContent()}
            </div>

            <AddTaskModal 
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
                onAddTask={handleAddTask}
                teamMembers={teamMembers}
            />
            {selectedTask && (
                <EditTaskModal
                    isOpen={isEditTaskModalOpen}
                    onClose={() => { setIsEditTaskModalOpen(false); setSelectedTask(null); }}
                    onEditTask={handleTaskUpdate}
                    task={selectedTask}
                    teamMembers={teamMembers}
                />
            )}
        </div>
    );
};

export default ProjectDetail;
