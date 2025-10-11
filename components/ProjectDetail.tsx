import React, { useState } from 'react';
import { Project, Task, Profile, Milestone, MilestoneInsert, UserRole } from '../types';
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
import BudgetView from './BudgetView';
import FinanceView from './FinanceView';
import ProgressPhotosView from './ProgressPhotosView';

interface ProjectDetailProps {
  project: Project;
  onProjectUpdate: (updatedProject: Project) => void;
  userProfile: Profile | null;
}

type Tab = 'tasks' | 'timeline' | 'milestones' | 'risks' | 'resources' | 'models' | 'budget' | 'finance' | 'photos';

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onProjectUpdate, userProfile }) => {
    const [activeTab, setActiveTab] = useState<Tab>('tasks');
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const teamMembers = project.teamMembers || [];
    
    const handleAddTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'project_id' | 'spent_cost'>) => {
        const { data, error } = await supabase
            .from('tasks')
            .insert([{ 
                ...taskData, 
                project_id: project.id,
                spent_cost: 0,
            }])
            .select()
            .single();

        if (error) {
            alert('Error adding task: ' + error.message);
        } else if (data) {
            const { data: updatedProjects, error: refreshError } = await supabase
                .from('projects')
                .select('*, tasks(*), milestones(*), project_team_members(*, profile:profiles(*))')
                .eq('id', project.id);
            
            if (refreshError) {
                 alert('Error refreshing project data: ' + refreshError.message);
            } else if (updatedProjects && updatedProjects.length > 0) {
                const updatedProjectData = updatedProjects[0];
                const formattedProject = {
                    ...updatedProjectData,
                    teamMembers: (updatedProjectData.project_team_members || []).map((ptm: any) => ptm.profile).filter(Boolean),
                    tasks: updatedProjectData.tasks as Task[],
                    milestones: updatedProjectData.milestones as Milestone[]
                };
                onProjectUpdate(formattedProject as Project);
            }
            setIsAddTaskModalOpen(false);
        }
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsEditTaskModalOpen(true);
    };

    const handleTaskUpdate = async (taskId: number, updateData: Partial<Task>) => {
        const { data, error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            alert('Error updating task: ' + error.message);
        } else if (data) {
            const { data: updatedProjects, error: refreshError } = await supabase
                .from('projects')
                .select('*, tasks(*), milestones(*), project_team_members(*, profile:profiles(*))')
                .eq('id', project.id);
            
            if (refreshError) {
                 alert('Error refreshing project data: ' + refreshError.message);
            } else if (updatedProjects && updatedProjects.length > 0) {
                const updatedProjectData = updatedProjects[0];
                const formattedProject = {
                    ...updatedProjectData,
                    teamMembers: (updatedProjectData.project_team_members || []).map((ptm: any) => ptm.profile).filter(Boolean),
                    tasks: updatedProjectData.tasks as Task[],
                    milestones: updatedProjectData.milestones as Milestone[]
                };
                onProjectUpdate(formattedProject as Project);
            }
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
            case 'finance':
                return <FinanceView project={project} userProfile={userProfile} onUpdateProject={onProjectUpdate} />;
            case 'photos':
                return <ProgressPhotosView project={project} userProfile={userProfile} />;
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
            case 'budget':
                return <BudgetView project={project} />;
            default:
                return null;
        }
    };
    
    const budget = project.budget || 0;
    const spent = project.spent || 0;
    const budgetProgress = budget > 0 ? (spent / budget) * 100 : 0;
    
    const totalTaskProgress = project.tasks.reduce((sum, task) => sum + (task.percent_complete || 0), 0);
    const overallProgress = project.tasks.length > 0 ? totalTaskProgress / project.tasks.length : 0;

    const tabs: {id: Tab, label: string}[] = [
        { id: 'tasks', label: 'Tasks' },
        { id: 'finance', label: 'Finance' },
        { id: 'photos', label: 'Progress Photos' },
        { id: 'budget', label: 'Budget' },
        { id: 'timeline', label: 'Timeline' },
        { id: 'milestones', label: 'Milestones' },
        { id: 'risks', label: 'Risk Analysis' },
        { id: 'resources', label: 'Resources' },
        { id: 'models', label: '3D Models' },
    ];

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex flex-col md:flex-row justify-between md:items-start">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground">{project.name}</h2>
                        <p className="text-muted-foreground mt-2 max-w-2xl">{project.description}</p>
                        <div className="mt-4 flex items-center space-x-4 text-sm text-muted-foreground">
                            <span><strong>Start:</strong> {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</span>
                            <span><strong>End:</strong> {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300`}>{project.status}</span>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:text-right">
                         <p className="font-semibold text-foreground">Team Members</p>
                         <div className="flex -space-x-2 mt-2 justify-end">
                            {teamMembers.map((profile) => <Avatar key={profile.id} profile={profile} size="md" />)}
                         </div>
                    </div>
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
                    <div>
                        <div className="flex justify-between text-sm font-medium text-foreground mb-1">
                            <span>Overall Progress</span>
                            <span>{overallProgress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-4">
                            <div className="bg-green-500 h-4 rounded-full" style={{ width: `${overallProgress}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm font-medium text-foreground mb-1">
                            <span>Budget Utilization</span>
                            <span>{`₹${spent.toLocaleString()} / ₹${budget.toLocaleString()}`}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-4">
                            <div className="bg-primary h-4 rounded-full" style={{ width: `${budgetProgress}%` }}></div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                         <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
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
                userProfile={userProfile}
            />
            {selectedTask && (
                <EditTaskModal
                    isOpen={isEditTaskModalOpen}
                    onClose={() => { setIsEditTaskModalOpen(false); setSelectedTask(null); }}
                    onUpdateTask={handleTaskUpdate}
                    task={selectedTask}
                    teamMembers={teamMembers}
                    userProfile={userProfile}
                />
            )}
        </div>
    );
};

export default ProjectDetail;