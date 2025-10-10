
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
  return (
    <Card className="mb-4 p-4 cursor-pointer hover:shadow-md relative" onClick={onEdit}>
      {task.pending_approval && (
        <div className="absolute top-2 right-2 h-3 w-3 bg-status-yellow rounded-full" title="Cost approval pending"></div>
      )}
      <p className="font-semibold text-neutral-dark mb-2 pr-4">{task.name}</p>
      
      <div className="mt-2 pt-2 border-t text-sm">
        <div className="flex justify-between items-center text-neutral-medium">
          <span>Cost:</span>
          <span className="font-semibold text-neutral-dark">
            ₹{(task.spent_cost || 0).toLocaleString()} / ₹{(task.budgeted_cost || 0).toLocaleString()}
          </span>
        </div>
        <p className="text-xs text-right text-neutral-medium mt-1">
            Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
        </p>
      </div>

      {task.assignee_id && (
        <div className="absolute bottom-2 right-2">
            <Avatar profile={{id: task.assignee_id, full_name: '', avatar_url: '', role: null }} size="sm" />
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
    <div className="bg-gray-100 rounded-lg p-4 w-full">
      <h3 className="font-bold text-lg text-neutral-dark mb-4 text-center">{status} ({tasks.length})</h3>
      <div className="h-[60vh] overflow-y-auto">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onEdit={() => onEditTask(task)} />
        ))}
      </div>
    </div>
  );
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskUpdate, onEditTask, onAddTask, userProfile }) => {
  const columns: TaskStatus[] = [TaskStatus.ToDo, TaskStatus.InProgress, TaskStatus.Done];

  const tasksByStatus = (status: TaskStatus) => tasks.filter(task => task.status === status);
  
  const canAddTask = userProfile?.role !== UserRole.SiteEngineerTechnician;

  return (
    <Card>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-neutral-dark">Task Board</h3>
            {canAddTask && (
                <button onClick={onAddTask} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors">
                    Add Task
                </button>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map(status => (
                // FIX: Correctly pass `status` and `tasks` props to KanbanColumn.
                // The `status` prop requires the status enum value, not the array of tasks.
                // The `tasks` prop was missing and is now supplied with the filtered tasks.
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
