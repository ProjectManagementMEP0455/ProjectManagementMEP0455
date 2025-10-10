import React, { useState, FormEvent, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { MOCK_USERS } from '../constants';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.Medium);
  const [equipmentSpecs, setEquipmentSpecs] = useState('');
  const [installationPhase, setInstallationPhase] = useState('');
  const [inspectionChecklist, setInspectionChecklist] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens and set dates to today
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setAssigneeIds([]);
      setStartDate(today);
      setDueDate(today);
      setPriority(TaskPriority.Medium);
      setEquipmentSpecs('');
      setInstallationPhase('');
      setInspectionChecklist('');
    }
  }, [isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !dueDate || assigneeIds.length === 0) {
      alert('Please fill out all required fields (Title, Start/Due Dates, Assignees).');
      return;
    }

    const newTask: Task = {
      id: `t${Date.now()}`,
      title,
      description,
      status: TaskStatus.ToDo,
      priority,
      startDate,
      dueDate,
      assigneeIds,
      equipmentSpecs,
      installationPhase,
      inspectionChecklist,
    };
    onAddTask(newTask);
    onClose();
  };
  
  const handleAssigneeChange = (userId: string) => {
    setAssigneeIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-neutral-dark mb-6">Add New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-medium">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-medium">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-neutral-medium">Start Date</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-neutral-medium">Due Date</label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-neutral-medium">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            >
              {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-medium">Assignees</label>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 border p-2 rounded-md max-h-32 overflow-y-auto">
              {MOCK_USERS.map(user => (
                <div key={user.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`user-${user.id}`}
                    checked={assigneeIds.includes(user.id)}
                    onChange={() => handleAssigneeChange(user.id)}
                    className="h-4 w-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
                  />
                  <label htmlFor={`user-${user.id}`} className="ml-3 text-sm text-neutral-dark">{user.name}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4 pt-4 border-t mt-4">
            <h3 className="text-lg font-semibold text-neutral-dark">MEP Specifics</h3>
            <div>
                <label htmlFor="equipmentSpecs" className="block text-sm font-medium text-neutral-medium">Equipment Specs</label>
                <textarea
                id="equipmentSpecs"
                value={equipmentSpecs}
                onChange={(e) => setEquipmentSpecs(e.target.value)}
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                placeholder="e.g., Chiller Model X, 2-inch copper pipes"
                />
            </div>
            <div>
                <label htmlFor="installationPhase" className="block text-sm font-medium text-neutral-medium">Installation Phase</label>
                <input
                type="text"
                id="installationPhase"
                value={installationPhase}
                onChange={(e) => setInstallationPhase(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                placeholder="e.g., Rough-in, Fit-out"
                />
            </div>
            <div>
                <label htmlFor="inspectionChecklist" className="block text-sm font-medium text-neutral-medium">Inspection Checklist Notes</label>
                <textarea
                id="inspectionChecklist"
                value={inspectionChecklist}
                onChange={(e) => setInspectionChecklist(e.target.value)}
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                placeholder="e.g., Check for code compliance with Section 4.1"
                />
            </div>
          </div>
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