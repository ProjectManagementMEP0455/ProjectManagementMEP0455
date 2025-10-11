import React, { useState, FormEvent, useEffect } from 'react';
import { Task, TaskStatus, Profile, UserRole } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Modal from './ui/Modal';
import Textarea from './ui/Textarea';

type NewTaskData = Omit<Task, 'id' | 'created_at' | 'project_id' | 'spent_cost'>;

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
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="taskName" className="block text-sm font-medium text-muted-foreground">Task Name</label>
          <Input type="text" id="taskName" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="taskDescription" className="block text-sm font-medium text-muted-foreground">Description</label>
          <Textarea id="taskDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
            <label htmlFor="taskStartDate" className="block text-sm font-medium text-muted-foreground">Start Date</label>
            <Input type="date" id="taskStartDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="taskDueDate" className="block text-sm font-medium text-muted-foreground">Due Date</label>
            <Input type="date" id="taskDueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
          </div>
        </div>
         <div>
            <label htmlFor="taskAssignee" className="block text-sm font-medium text-muted-foreground">Assignee</label>
            <select
              id="taskAssignee"
              value={assigneeId || ''}
              onChange={(e) => setAssigneeId(e.target.value || null)}
              className="mt-1 block w-full bg-input border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Unassigned</option>
              {teamMembers.map(user => (
                <option key={user.id} value={user.id}>{user.full_name}</option>
              ))}
            </select>
          </div>
           {isManager && (
              <div>
                  <label htmlFor="taskBudget" className="block text-sm font-medium text-muted-foreground">Budgeted Cost (₹)</label>
                  <Input type="number" id="taskBudget" value={budgetedCost} onChange={(e) => setBudgetedCost(Number(e.target.value))} min="0" />
              </div>
          )}
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" onClick={onClose} variant="secondary" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}>Cancel</Button>
          <Button type="submit" variant="primary" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>Add Task</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddTaskModal;