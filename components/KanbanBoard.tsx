import React from 'react';
import { Task, TaskStatus, Profile, UserRole } from '../types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (tasks: Task[]) => void;
  onEditTask: (task: Task) => void;
  onAddTask: () => void;
  userProfile: Profile | null;
}

const TaskCard: React.FC<{ task: Task; onEdit: () => void; }> = ({ task, onEdit }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== TaskStatus.Done;
  const progress = task.percent_complete || 0;
  
  return (
    <Card className="mb-4 p-4 cursor-pointer hover:shadow-lg relative transition-all duration-200" onClick={onEdit}>
      {task.pending_approval && (
        <div className="absolute top-2 right-2 h-3 w-3 bg-status-yellow rounded-full ring-2 ring-white" title="Cost approval pending"></div>
      )}
      <p className="font-semibold text-neutral-darkest mb-2 pr-4">{task.name}</p>
      
      <div className="text-sm space-y-3 mt-3">
        <div className="flex justify-between items-center text-neutral-medium">
          <span>Cost:</span>
          <span className="font-semibold text-neutral-dark">
            ₹{(task.spent_cost || 0).toLocaleString()} / ₹{(task.budgeted_cost || 0).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-neutral-medium">
            <span>Due Date:</span>
            <span className={`font-semibold ${isOverdue ? 'text-status-red' : 'text-neutral-dark'}`}>
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
            </span>
        </div>
      </div>
      
      <div className="mt-4">
          <div className="w-full bg-neutral-lightest rounded-full h-2">
              <div className="bg-status-green h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
      </div>

      {task.assignee && (
        <div className="absolute bottom-3 right-3">
            <Avatar profile={task.assignee} size="sm" />
        </div>
      )}
    </Card>
  );
};

const KanbanColumn: React.FC<{
  status: TaskStatus;
  tasks: Task[];
  onEditTask: (task: Task) => void;
}> = ({ status, tasks, onEditTask }) => {
  return (
    <div className="bg-neutral-lightest rounded-xl p-4 w-full">
      <h3 className="font-bold text-lg text-neutral-darkest mb-4 text-center">{status} ({tasks.length})</h3>
      <div className="h-[60vh] overflow-y-auto px-1">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onEdit={() => onEditTask(task)} />
        ))}
      </div>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskUpdate, onEditTask, onAddTask, userProfile }) => {
  const columns: TaskStatus[] = [TaskStatus.ToDo, TaskStatus.InProgress, TaskStatus.Done];
  
  const tasksWithAssignee = tasks.map(task => {
    // Assuming team members are available on the project object, which they should be.
    // This is a placeholder for a more robust user fetching mechanism if needed.
    const assignee = null; // In a real app, you'd find the user profile here.
    return {...task, assignee};
  });

  const tasksByStatus = (status: TaskStatus) => tasksWithAssignee.filter(task => task.status === status);
  
  const canAddTask = userProfile?.role !== UserRole.SiteEngineerTechnician;

  return (
    <Card>
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-neutral-darkest">Task Board</h3>
            {canAddTask && (
                <button onClick={onAddTask} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors flex items-center">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                    Add Task
                </button>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map(status => (
                <KanbanColumn
                    key={status}
                    status={status}
                    tasks={tasksByStatus(status)}
                    onEditTask={onEditTask}
                />
            ))}
        </div>
    </Card>
  );
};

export default KanbanBoard;