import React, { useState } from 'react';
import { Project, ProjectStatus, Task, User } from '../types';
import { MOCK_USERS } from '../constants';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import KanbanBoard from './KanbanBoard';
import GanttChart from './GanttChart';
import MilestonesView from './MilestonesView';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';

type ProjectDetailView = 'overview' | 'tasks' | 'gantt' | 'milestones';

interface ProjectDetailProps {
    project: Project;
    onTasksUpdate: (projectId: string, tasks: Task[]) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project: initialProject, onTasksUpdate }) => {
  const [project, setProject] = useState<Project>(initialProject);
  const [activeView, setActiveView] = useState<ProjectDetailView>('overview');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const teamMembers = MOCK_USERS.filter(user => project.teamMemberIds.includes(user.id));
  const progress = project.budget > 0 ? (project.spent / project.budget) * 100 : 0;
  
  const handleTaskUpdate = (updatedTasks: Task[]) => {
      setProject(prev => ({...prev, tasks: updatedTasks}));
      onTasksUpdate(project.id, updatedTasks);
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `t${project.id}-${project.tasks.length + 1}`,
    };
    const updatedTasks = [...project.tasks, newTask];
    setProject(prev => ({ ...prev, tasks: updatedTasks}));
    onTasksUpdate(project.id, updatedTasks);
    setIsAddTaskModalOpen(false);
  };
  
  const handleEditTask = (updatedTask: Task) => {
    const updatedTasks = project.tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
    setProject(prev => ({
        ...prev,
        tasks: updatedTasks
    }));
    onTasksUpdate(project.id, updatedTasks);
    setIsEditTaskModalOpen(false);
    setSelectedTask(null);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
  };

  const renderView = () => {
    switch (activeView) {
      case 'tasks':
        return <KanbanBoard tasks={project.tasks} onTaskUpdate={handleTaskUpdate} onEditTask={openEditModal} onAddTask={() => setIsAddTaskModalOpen(true)} />;
      case 'gantt':
        return <GanttChart tasks={project.tasks} projectStartDate={project.startDate} projectEndDate={project.endDate} />;
      case 'milestones':
          return <MilestonesView milestones={project.milestones} />;
      case 'overview':
      default:
        return renderOverview();
    }
  };
  
  const formatCurrencyINR = (value: number) => {
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
                    {teamMembers.map(user => (
                        <li key={user.id} className="flex items-center space-x-3">
                            <Avatar user={user} size="md" />
                            <div>
                                <p className="font-semibold text-neutral-dark">{user.name}</p>
                                <p className="text-sm text-neutral-medium">{user.role}</p>
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
            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
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
