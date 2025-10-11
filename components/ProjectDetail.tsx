
import React, { useState, useEffect } from 'react';
import { Project, Task, Profile, Milestone, MilestoneInsert, UserRole } from '../types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import KanbanBoard from './KanbanBoard';
import GanttChart from './GanttChart';
import MilestonesView from './MilestonesView';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import { supabase } from '../lib/supabaseClient';
import BudgetView from './BudgetView';
import FinanceView from './FinanceView';
import ProgressPhotosView from './ProgressPhotosView';
import { useAppSettings } from '../App';
import Button from './ui/Button';

interface ProjectDetailProps {
  project: Project;
  onProjectUpdate: (updatedProject: Project) => void;
  userProfile: Profile | null;
}

type Tab = 'tasks' | 'team' | 'timeline' | 'milestones' | 'budget' | 'finance' | 'photos';

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onProjectUpdate, userProfile }) => {
    const [activeTab, setActiveTab] = useState<Tab>('tasks');
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const { calculateOverallProgress } = useAppSettings();

    // State for Team Management
    const [allUsers, setAllUsers] = useState<Profile[]>([]);
    const [selectedTeamMemberIds, setSelectedTeamMemberIds] = useState<string[]>([]);
    const [isTeamLoading, setIsTeamLoading] = useState(false);
    const [isTeamSaving, setIsTeamSaving] = useState(false);

    const teamMembers = project.teamMembers || [];

    useEffect(() => {
        const fetchAllUsers = async () => {
            setIsTeamLoading(true);
            const { data, error } = await supabase.from('profiles').select('*');
            if (error) {
                console.error("Error fetching all users:", error);
            } else {
                setAllUsers(data || []);
            }
            setIsTeamLoading(false);
        };

        if (activeTab === 'team') {
            fetchAllUsers();
        }
    }, [activeTab]);

    useEffect(() => {
        if (project.teamMembers) {
            setSelectedTeamMemberIds(project.teamMembers.map(m => m.id));
        }
    }, [project.teamMembers]);
    
    const refetchProject = async () => {
        const { data: updatedProjects, error: refreshError } = await supabase
            .from('projects')
            .select(`
                *,
                tasks(*, assignee:profiles!assignee_id(*)),
                milestones(*),
                team_member_joins:project_team_members(*, profile:profiles!user_id(*))
            `)
            .eq('id', project.id);
        
        if (refreshError) {
             console.error('Error refreshing project data:', refreshError);
        } else if (updatedProjects && updatedProjects.length > 0) {
            const updatedProjectData = updatedProjects[0];
            const formattedProject = {
                ...updatedProjectData,
                teamMembers: (updatedProjectData.team_member_joins || []).map((ptm: any) => ptm.profile).filter(Boolean),
                tasks: updatedProjectData.tasks as Task[],
                milestones: updatedProjectData.milestones as Milestone[]
            };
            onProjectUpdate(formattedProject as Project);
        }
    };

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
            console.error('Error adding task: ' + error.message);
        } else if (data) {
            await refetchProject();
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
            console.error('Error updating task: ' + error.message);
        } else if (data) {
            await refetchProject();
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
            console.error('Error adding milestone: ' + error.message);
        } else if (data) {
            const updatedMilestones = [...project.milestones, data as Milestone];
            const updatedProject = { ...project, milestones: updatedMilestones };
            onProjectUpdate(updatedProject);
        }
    };
    
    const handleTeamUpdate = async () => {
        setIsTeamSaving(true);
        const { error: deleteError } = await supabase
            .from('project_team_members')
            .delete()
            .eq('project_id', project.id);

        if (deleteError) {
            console.error("Error clearing team members:", deleteError);
            alert("Failed to update team. Please try again.");
            setIsTeamSaving(false);
            return;
        }

        const newTeamMembers = selectedTeamMemberIds.map(userId => ({
            project_id: project.id,
            user_id: userId,
        }));

        if (newTeamMembers.length > 0) {
            const { error: insertError } = await supabase
                .from('project_team_members')
                .insert(newTeamMembers);

            if (insertError) {
                console.error("Error inserting new team members:", insertError);
                alert("Failed to update team. Please try again.");
                setIsTeamSaving(false);
                return;
            }
        }
        
        await refetchProject();
        setIsTeamSaving(false);
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
            case 'team':
                const canManageTeam = userProfile && [
                    UserRole.Admin,
                    UserRole.ProjectDirector,
                    UserRole.ProjectManager,
                ].includes(userProfile.role);

                return (
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-foreground">Manage Team Members</h3>
                            {canManageTeam && (
                                <Button onClick={handleTeamUpdate} disabled={isTeamSaving} variant="primary">
                                    {isTeamSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            )}
                        </div>
                        {isTeamLoading ? <p>Loading users...</p> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                                {allUsers.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted">
                                        <div className="flex items-center space-x-3">
                                            <Avatar profile={user} size="md"/>
                                            <div>
                                                <p className="font-semibold">{user.full_name}</p>
                                                <p className="text-xs text-muted-foreground">{user.role}</p>
                                            </div>
                                        </div>
                                        {canManageTeam ? (
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5 rounded bg-input border-border text-primary focus:ring-primary"
                                                checked={selectedTeamMemberIds.includes(user.id)}
                                                onChange={() => {
                                                    setSelectedTeamMemberIds(prev =>
                                                        prev.includes(user.id)
                                                            ? prev.filter(id => id !== user.id)
                                                            : [...prev, user.id]
                                                    );
                                                }}
                                            />
                                        ) : (
                                            selectedTeamMemberIds.includes(user.id) && <div className="h-5 w-5 text-primary"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                );
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
            case 'budget':
                return <BudgetView project={project} />;
            default:
                return null;
        }
    };
    
    const budget = project.budget || 0;
    const spent = project.spent || 0;
    const budgetProgress = budget > 0 ? (spent / budget) * 100 : 0;
    
    const overallProgress = calculateOverallProgress(project);

    const tabs: {id: Tab, label: string}[] = [
        { id: 'tasks', label: 'Tasks' },
        { id: 'team', label: 'Team' },
        { id: 'timeline', label: 'Timeline' },
        { id: 'milestones', label: 'Milestones' },
        { id: 'finance', label: 'Finance' },
        { id: 'budget', label: 'Budget' },
        { id: 'photos', label: 'Progress Photos' },
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
