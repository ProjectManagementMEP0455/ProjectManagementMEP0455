import React from 'react';
import { Task, TaskStatus, User } from '../types';
import { MOCK_USERS } from '../constants';
import Card from './ui/Card';
import Avatar from './ui/Avatar';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (tasks: Task[]) => void;
  onEditTask: (task: Task) => void;
  onAddTask: () => void;
}

const TaskCard: React.FC<{ task: Task, onEdit: () => void }> = ({ task, onEdit }) => {
  const assignee = MOCK_USERS.find(u => u.id === task.assigneeId);
  
  return (
    <Card className="mb-4 p-4 cursor-pointer hover:shadow-md" onClick={onEdit}>
      <p className="font-semibold text-neutral-dark mb-2">{task.name}</p>
      {assignee && (
        <div className="flex items-center justify-end">
            <Avatar user={assignee} size="sm" />
        </div>
      )}
      <p className="text-sm text-neutral-medium mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
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

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskUpdate, onEditTask, onAddTask }) => {
  const columns: TaskStatus[] = [TaskStatus.ToDo, TaskStatus.InProgress, TaskStatus.Done];

  const tasksByStatus = (status: TaskStatus) => tasks.filter(task => task.status === status);

  return (
    <Card>
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-neutral-dark">Task Board</h3>
            <button onClick={onAddTask} className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors">
                Add Task
            </button>
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
