import React from 'react';
import { Task, TaskStatus, Profile, UserRole } from '../types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';
import Button from './ui/Button';

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
    <Card className="mb-4 p-4 cursor-pointer hover:shadow-lg relative transition-all duration-200 hover:border-primary/50" onClick={onEdit}>
      {task.pending_approval && (
        <div className="absolute top-2 right-2 h-3 w-3 bg-yellow-400 rounded-full ring-2 ring-background" title="Cost approval pending"></div>
      )}
      <p className="font-semibold text-foreground mb-2 pr-4">{task.name}</p>
      
      <div className="text-sm space-y-3 mt-3">
        <div className="flex justify-between items-center text-muted-foreground">
          <span>Cost:</span>
          <span className="font-semibold text-foreground">
            ₹{(task.spent_cost || 0).toLocaleString()} / ₹{(task.budgeted_cost || 0).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center text-muted-foreground">
            <span>Due Date:</span>
            <span className={`font-semibold ${isOverdue ? 'text-destructive' : 'text-foreground'}`}>
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
            </span>
        </div>
      </div>
      
      <div className="mt-4">
          <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
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
    <div className="bg-secondary/30 rounded-xl p-4 w-full">
      <h3 className="font-bold text-lg text-foreground mb-4 text-center">{status} ({tasks.length})</h3>
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
    const assignee = null;
    return {...task, assignee};
  });

  const tasksByStatus = (status: TaskStatus) => tasksWithAssignee.filter(task => task.status === status);
  
  const canAddTask = userProfile?.role !== UserRole.SiteEngineerTechnician;

  return (
    <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-foreground">Task Board</h3>
            {canAddTask && (
                <Button 
                    onClick={onAddTask} 
                    variant="primary" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                >
                    Add Task
                </Button>
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