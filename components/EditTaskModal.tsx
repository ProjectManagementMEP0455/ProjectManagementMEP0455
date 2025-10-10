import React, { useState, FormEvent, useEffect } from 'react';
import { Task, TaskStatus, User } from '../types';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditTask: (task: Task) => void;
  task: Task;
  teamMembers: User[];
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, onEditTask, task, teamMembers }) => {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [assigneeId, setAssigneeId] = useState<string | null>(task.assigneeId);
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [status, setStatus] = useState<TaskStatus>(task.status);

  useEffect(() => {
    if (task) {
        setName(task.name);
        setDescription(task.description);
        setAssigneeId(task.assigneeId);
        setDueDate(task.dueDate);
        setStatus(task.status);
    }
  }, [task, isOpen]);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !dueDate) {
      alert('Please fill out task name and due date.');
      return;
    }
    
    onEditTask({
      ...task,
      name,
      description,
      status,
      assigneeId,
      dueDate,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-neutral-dark mb-6">Edit Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editTaskName" className="block text-sm font-medium text-neutral-medium">Task Name</label>
            <input
              type="text"
              id="editTaskName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="editTaskDescription" className="block text-sm font-medium text-neutral-medium">Description</label>
            <textarea
              id="editTaskDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="editTaskAssignee" className="block text-sm font-medium text-neutral-medium">Assignee</label>
              <select
                id="editTaskAssignee"
                value={assigneeId || ''}
                onChange={(e) => setAssigneeId(e.target.value || null)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              >
                <option value="">Unassigned</option>
                {teamMembers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="editTaskDueDate" className="block text-sm font-medium text-neutral-medium">Due Date</label>
              <input
                type="date"
                id="editTaskDueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="editTaskStatus" className="block text-sm font-medium text-neutral-medium">Status</label>
            <select
              id="editTaskStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            >
              {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-dark bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-dark transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
