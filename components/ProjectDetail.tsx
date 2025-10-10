import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus, Task, Profile } from '../types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import KanbanBoard from './KanbanBoard';
import GanttChart from './GanttChart';
import MilestonesView from './MilestonesView';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import { supabase } from '../lib/supabaseClient';

type ProjectDetailView = 'overview' | 'tasks' | 'gantt' | 'milestones';

interface ProjectDetailProps {
    project: Project;
    onProjectUpdate: (project: Project) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project: initialProject, onProjectUpdate }) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [activeView, setActiveView] = useState<ProjectDetailView>('overview');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    setProject(initialProject);
  }, [initialProject]);

  const teamMembers = project.teamMembers || [];
  const progress = (project.budget || 0) > 0 ? ((project.spent || 0) / (project.budget || 1)) * 100 : 0;
  
  const handleAddTask = async (newTaskData: Omit<Task, 'id' | 'created_at' | 'project_id'>) => {
    try {
        const { data: newTask, error } = await supabase
            .from('tasks')
            .insert({ ...newTaskData, project_id: project.id })
            .select()
            .single();

        if (error) throw error;
        
        const updatedTasks = [...project.tasks, newTask];
        const updatedProject = { ...project, tasks: updatedTasks };
        setProject(updatedProject);
        onProjectUpdate(updatedProject);
        setIsAddTaskModalOpen(false);

    } catch (error: any) {
        alert("Error adding task: " + error.message);
    }
  };
  
  const handleEditTask = async (updatedTask: Task) => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .update({
                name: updatedTask.name,
                description: updatedTask.description,
                status: updatedTask.status,
                assignee_id: updatedTask.assignee_id,
                due_date: updatedTask.due_date,
                percent_complete: updatedTask.percent_complete
            })
            .eq('id', updatedTask.id)
            .select()
            .single();

        if (error) throw error;

        // FIX: Add null check for data to resolve 'possibly null' error.
        if (!data) {
            alert("Error updating task: Could not find updated task record.");
            return;
        }

        const updatedTasks = project.tasks.map(task => task.id === data.id ? data : task);
        const updatedProject = { ...project, tasks: updatedTasks };
        setProject(updatedProject);
        onProjectUpdate(updatedProject);
        setIsEditTaskModalOpen(false);
        setSelectedTask(null);
    } catch (error: any) {
        alert("Error updating task: " + error.message);
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
  };

  const renderView = () => {
    switch (activeView) {
      case 'tasks':
        return <KanbanBoard tasks={project.tasks} onTaskUpdate={() => {}} onEditTask={openEditModal} onAddTask={() => setIsAddTaskModalOpen(true)} />;
      case 'gantt':
        return <GanttChart tasks={project.tasks} projectStartDate={project.start_date || ''} projectEndDate={project.end_date || ''} />;
      case 'milestones':
          return <MilestonesView milestones={project.milestones} />;
      case 'overview':
      default:
        return renderOverview();
    }
  };
  
  const formatCurrencyINR = (value: number | null) => {
    if (value === null) return '₹0';
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${new Intl.NumberFormat('en-IN').format(value)}`;
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <h3 className="text-xl font-semibold mb-2 text-neutral-dark">Project Description</h3>
                <p className="text-neutral-medium">{project.description}</p>
            </Card>
            <Card>
                <h3 className="text-xl font-semibold mb-4 text-neutral-dark">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-sm text-neutral-medium">Status</p>
                        <p className={`font-bold text-lg ${project.status === ProjectStatus.Active ? 'text-status-blue' : 'text-neutral-dark'}`}>{project.status}</p>
                    </div>
                     <div>
                        <p className="text-sm text-neutral-medium">Progress</p>
                        <p className="font-bold text-lg text-brand-primary">{progress.toFixed(0)}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-neutral-medium">Budget</p>
                        <p className="font-bold text-lg text-neutral-dark">{formatCurrencyINR(project.budget)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-neutral-medium">Spent</p>
                        <p className="font-bold text-lg text-neutral-dark">{formatCurrencyINR(project.spent)}</p>
                    </div>
                </div>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <h3 className="text-xl font-semibold mb-4 text-neutral-dark">Team Members</h3>
                <ul className="space-y-3">
                    {teamMembers.map((profile: Profile) => (
                        <li key={profile.id} className="flex items-center space-x-3">
                            <Avatar profile={profile} size="md" />
                            <div>
                                <p className="font-semibold text-neutral-dark">{profile.full_name}</p>
                                <p className="text-sm text-neutral-medium">{profile.role}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-neutral-dark">{project.name}</h2>
          <p className="text-neutral-medium">
            {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div className="flex items-center bg-gray-200 rounded-lg p-1">
          {(['overview', 'tasks', 'gantt', 'milestones'] as ProjectDetailView[]).map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors capitalize ${
                activeView === view ? 'bg-white text-brand-primary shadow' : 'text-neutral-medium hover:bg-gray-300'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>
      
      <div>{renderView()}</div>
      
      <AddTaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
        teamMembers={teamMembers}
      />

      {selectedTask && (
        <EditTaskModal
            isOpen={isEditTaskModalOpen}
            onClose={() => {
                setIsEditTaskModalOpen(false);
                setSelectedTask(null);
            }}
            onEditTask={handleEditTask}
            task={selectedTask}
            teamMembers={teamMembers}
        />
      )}

    </div>
  );
};

export default ProjectDetail;