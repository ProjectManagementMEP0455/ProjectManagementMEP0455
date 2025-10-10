import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { MOCK_USERS } from '../constants';
import Card from './ui/Card';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (newTask: Task) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.ToDo);
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !dueDate) {
      alert('Task title, start date, and due date are required.');
      return;
    }

    const newTask: Task = {
      id: `t-${Date.now()}`, // Simple unique ID generation
      title,
      description,
      status,
      priority,
      startDate,
      dueDate,
      assigneeIds,
    };

    onAddTask(newTask);
    onClose(); // Close modal after adding
    // Reset form
    setTitle('');
    setDescription('');
    setAssigneeIds([]);
    setStatus(TaskStatus.ToDo);
    setPriority(TaskPriority.Medium);
    setStartDate('');
    setDueDate('');
  };

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
          onClose();
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={handleOverlayClick}>
      <Card className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-dark">Add New Task</h2>
          <button onClick={onClose} className="text-2xl text-neutral-medium hover:text-neutral-dark">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-dark mb-1">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-dark mb-1">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              />
            </div>
            <div>
               <label htmlFor="assignees" className="block text-sm font-medium text-neutral-dark mb-1">Assignees</label>
               <select
                 multiple
                 id="assignees"
                 value={assigneeIds}
                 onChange={(e) => setAssigneeIds(Array.from(e.target.selectedOptions, option => option.value))}
                 className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary h-24"
               >
                 {MOCK_USERS.map(user => (
                   <option key={user.id} value={user.id}>{user.name}</option>
                 ))}
               </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label htmlFor="status" className="block text-sm font-medium text-neutral-dark mb-1">Status</label>
                 <select id="status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary">
                    {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
               </div>
               <div>
                 <label htmlFor="priority" className="block text-sm font-medium text-neutral-dark mb-1">Priority</label>
                 <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary">
                    {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
                 </select>
               </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label htmlFor="startDate" className="block text-sm font-medium text-neutral-dark mb-1">Start Date</label>
                 <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
               </div>
               <div>
                 <label htmlFor="dueDate" className="block text-sm font-medium text-neutral-dark mb-1">Due Date</label>
                 <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
               </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-gray-200 text-neutral-dark font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors">
              Create Task
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddTaskModal;