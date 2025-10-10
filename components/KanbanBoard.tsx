import React from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { MOCK_USERS } from '../constants';
import Avatar from './ui/Avatar';
import { ICONS } from '../constants';

interface KanbanBoardProps {
  tasks: Task[];
  onOpenAddTaskModal: () => void;
}

const priorityStyles: { [key in TaskPriority]: { bg: string; text: string; } } = {
  [TaskPriority.Critical]: { bg: 'bg-red-600', text: 'text-white' },
  [TaskPriority.High]: { bg: 'bg-orange-500', text: 'text-white' },
  [TaskPriority.Medium]: { bg: 'bg-yellow-400', text: 'text-neutral-dark' },
  [TaskPriority.Low]: { bg: 'bg-green-500', text: 'text-white' },
};

const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
  const assignees = MOCK_USERS.filter(user => task.assigneeIds.includes(user.id));
  const { bg, text } = priorityStyles[task.priority];
  
  return (
    <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 mb-3 cursor-grab hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <p className="font-semibold text-neutral-dark">{task.title}</p>
        <span className={`px-2 py-0.5 text-xs font-bold rounded ${bg} ${text}`}>{task.priority}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <p className="text-neutral-medium">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
        <div className="flex -space-x-2">
          {assignees.map(user => <Avatar key={user.id} user={user} size="sm" />)}
        </div>
      </div>
    </div>
  );
};

const KanbanColumn: React.FC<{ title: string; tasks: Task[]; onOpenAddTaskModal?: () => void; }> = ({ title, tasks, onOpenAddTaskModal }) => {
  return (
    <div className="bg-gray-100 rounded-lg p-3 flex-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-neutral-dark">{title}</h3>
        <span className="bg-gray-300 text-neutral-dark text-sm font-semibold px-2 py-1 rounded-full">{tasks.length}</span>
      </div>
      <div>
        {tasks.map(task => <TaskCard key={task.id} task={task} />)}
      </div>
      {onOpenAddTaskModal && (
        <button
          onClick={onOpenAddTaskModal}
          className="w-full mt-2 flex items-center justify-center text-neutral-medium hover:bg-gray-200 p-2 rounded-md transition-colors"
        >
          {ICONS.plus}
          <span className="ml-2">Add Task</span>
        </button>
      )}
    </div>
  );
};


const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onOpenAddTaskModal }) => {
  const columns: { title: TaskStatus; tasks: Task[] }[] = [
    { title: TaskStatus.ToDo, tasks: tasks.filter(t => t.status === TaskStatus.ToDo) },
    { title: TaskStatus.InProgress, tasks: tasks.filter(t => t.status === TaskStatus.InProgress) },
    { title: TaskStatus.InReview, tasks: tasks.filter(t => t.status === TaskStatus.InReview) },
    { title: TaskStatus.Done, tasks: tasks.filter(t => t.status === TaskStatus.Done) },
  ];

  return (
    <div className="flex space-x-4">
      {columns.map(col => (
        <KanbanColumn
          key={col.title}
          title={col.title}
          tasks={col.tasks}
          onOpenAddTaskModal={col.title === TaskStatus.ToDo ? onOpenAddTaskModal : undefined}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;