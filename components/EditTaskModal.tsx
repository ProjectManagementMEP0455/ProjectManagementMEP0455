import React, { useState, FormEvent, useEffect } from 'react';
import { Task, TaskStatus, Profile, UserRole } from '../types';
import Button from './ui/Button';
import Input from './ui/Input';
import Modal from './ui/Modal';
import Textarea from './ui/Textarea';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: number, updateData: Partial<Task>) => void;
  task: Task;
  teamMembers: Profile[];
  userProfile: Profile | null;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, onUpdateTask, task, teamMembers, userProfile }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.ToDo);
  const [percentComplete, setPercentComplete] = useState(0);
  const [budgetedCost, setBudgetedCost] = useState(0);

  const isManager = userProfile && [UserRole.Admin, UserRole.ProjectDirector, UserRole.ProjectManager].includes(userProfile.role);

  useEffect(() => {
    if (task) {
        setName(task.name);
        setDescription(task.description || '');
        setAssigneeId(task.assignee_id);
        setStartDate(task.start_date?.split('T')[0] || '');
        setDueDate(task.due_date?.split('T')[0] || '');
        setStatus(task.status as TaskStatus);
        setPercentComplete(task.percent_complete || 0);
        setBudgetedCost(task.budgeted_cost || 0);
    }
  }, [task, isOpen]);
  
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
    
    let updatePayload: Partial<Task> = {
        name,
        description,
        status,
        assignee_id: assigneeId,
        start_date: startDate,
        due_date: dueDate,
        percent_complete: percentComplete,
    };

    if (isManager) {
        updatePayload.budgeted_cost = budgetedCost;
    }

    onUpdateTask(task.id, updatePayload);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="editTaskName" className="block text-sm font-medium text-muted-foreground">Task Name</label>
            <Input type="text" id="editTaskName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="editTaskDescription" className="block text-sm font-medium text-muted-foreground">Description</label>
            <Textarea id="editTaskDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="editTaskStartDate" className="block text-sm font-medium text-muted-foreground">Start Date</label>
              <Input type="date" id="editTaskStartDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="editTaskDueDate" className="block text-sm font-medium text-muted-foreground">Due Date</label>
              <Input type="date" id="editTaskDueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
          </div>
          <div>
            <label htmlFor="editTaskAssignee" className="block text-sm font-medium text-muted-foreground">Assignee</label>
            <select id="editTaskAssignee" value={assigneeId || ''} onChange={(e) => setAssigneeId(e.target.value || null)} className="mt-1 block w-full bg-input border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Unassigned</option>
              {teamMembers.map(user => <option key={user.id} value={user.id}>{user.full_name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="editTaskStatus" className="block text-sm font-medium text-muted-foreground">Status</label>
            <select id="editTaskStatus" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="mt-1 block w-full bg-input border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring">
              {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="editTaskPercent" className="block text-sm font-medium text-muted-foreground">Percent Complete: {percentComplete}%</label>
            <input type="range" id="editTaskPercent" min="0" max="100" step="5" value={percentComplete} onChange={(e) => setPercentComplete(Number(e.target.value))} className="mt-1 block w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"/>
          </div>

          <div className="border-t border-border pt-6 mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Budget & Cost</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="taskBudget" className="block text-sm font-medium text-muted-foreground">Budgeted Cost (₹)</label>
                    <Input type="number" id="taskBudget" value={budgetedCost} onChange={(e) => setBudgetedCost(Number(e.target.value))} min="0" disabled={!isManager} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground">Approved Spent (₹)</label>
                    <p className="mt-1 text-lg font-semibold p-2 bg-secondary rounded-md">₹{(task.spent_cost || 0).toLocaleString()}</p>
                </div>
            </div>
             <p className="text-xs text-muted-foreground mt-1">Total spent is calculated from approved expenses in the 'Finance' tab.</p>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t border-border">
            <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
            <Button type="submit" variant="primary">Save Changes</Button>
          </div>
        </form>
    </Modal>
  );
};

export default EditTaskModal;