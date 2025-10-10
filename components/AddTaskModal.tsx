
import React, { useState, FormEvent, useEffect } from 'react';
import { Task, TaskStatus, Profile, UserRole } from '../types';

type NewTaskData = Omit<Task, 'id' | 'created_at' | 'project_id' | 'spent_cost' | 'proposed_spent_cost' | 'pending_approval'>;

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (taskData: NewTaskData) => void;
  teamMembers: Profile[];
  userProfile: Profile | null;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask, teamMembers, userProfile }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [budgetedCost, setBudgetedCost] = useState(0);

  const isManager = userProfile && [UserRole.Admin, UserRole.ProjectDirector, UserRole.ProjectManager].includes(userProfile.role);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setName('');
      setDescription('');
      setAssigneeId(null);
      setStartDate(today);
      setDueDate('');
      setBudgetedCost(0);
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !dueDate) {
      alert('Please fill out task name, start date, and due date.');
      return;
    }
    if (new Date(startDate) > new Date(dueDate)) {
        alert('Due date cannot be earlier than start date.');
        return;
    }
    
    onAddTask({
      name,
      description,
      status: TaskStatus.ToDo,
      assignee_id: assigneeId,
      start_date: startDate,
      due_date: dueDate,
      percent_complete: 0,
      budgeted_cost: budgetedCost,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-neutral-dark mb-6">Add New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium text-neutral-medium">Task Name</label>
            <input
              type="text"
              id="taskName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="taskDescription" className="block text-sm font-medium text-neutral-medium">Description</label>
            <textarea
              id="taskDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label htmlFor="taskStartDate" className="block text-sm font-medium text-neutral-medium">Start Date</label>
              <input
                type="date"
                id="taskStartDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="taskDueDate" className="block text-sm font-medium text-neutral-medium">Due Date</label>
              <input
                type="date"
                id="taskDueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
          </div>
           <div>
              <label htmlFor="taskAssignee" className="block text-sm font-medium text-neutral-medium">Assignee</label>
              <select
                id="taskAssignee"
                value={assigneeId || ''}
                onChange={(e) => setAssigneeId(e.target.value || null)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              >
                <option value="">Unassigned</option>
                {teamMembers.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
              </select>
            </div>
             {isManager && (
                <div>
                    <label htmlFor="taskBudget" className="block text-sm font-medium text-neutral-medium">Budgeted Cost (₹)</label>
                    <input
                    type="number"
                    id="taskBudget"
                    value={budgetedCost}
                    onChange={(e) => setBudgetedCost(Number(e.target.value))}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                    min="0"
                    />
                </div>
            )}
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-dark bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-dark transition-colors">
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
