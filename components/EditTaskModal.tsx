
import React, { useState, FormEvent, useEffect } from 'react';
import { Task, TaskStatus, Profile, UserRole } from '../types';

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
  const [proposedSpentCostInput, setProposedSpentCostInput] = useState(0);

  const isManager = userProfile && [UserRole.Admin, UserRole.ProjectDirector, UserRole.ProjectManager].includes(userProfile.role);

  useEffect(() => {
    if (task) {
        setName(task.name);
        setDescription(task.description || '');
        setAssigneeId(task.assignee_id);
        setStartDate(task.start_date || '');
        setDueDate(task.due_date || '');
        setStatus(task.status as TaskStatus);
        setPercentComplete(task.percent_complete || 0);
        setBudgetedCost(task.budgeted_cost || 0);
        setProposedSpentCostInput(0);
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
    } else if (proposedSpentCostInput > 0 && !task.pending_approval) {
        updatePayload.proposed_spent_cost = proposedSpentCostInput;
        updatePayload.pending_approval = true;
    }

    onUpdateTask(task.id, updatePayload);
    onClose();
  };

  const handleApprove = () => {
    const newSpentCost = (task.spent_cost || 0) + (task.proposed_spent_cost || 0);
    onUpdateTask(task.id, {
        spent_cost: newSpentCost,
        proposed_spent_cost: null,
        pending_approval: false,
    });
    onClose();
  };

  const handleReject = () => {
     onUpdateTask(task.id, {
        proposed_spent_cost: null,
        pending_approval: false,
    });
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-neutral-dark mb-6">Edit Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Standard task fields */}
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
              <label htmlFor="editTaskStartDate" className="block text-sm font-medium text-neutral-medium">Start Date</label>
              <input type="date" id="editTaskStartDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full form-input" required />
            </div>
            <div>
              <label htmlFor="editTaskDueDate" className="block text-sm font-medium text-neutral-medium">Due Date</label>
              <input type="date" id="editTaskDueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 block w-full form-input" required />
            </div>
          </div>
          <div>
            <label htmlFor="editTaskAssignee" className="block text-sm font-medium text-neutral-medium">Assignee</label>
            <select id="editTaskAssignee" value={assigneeId || ''} onChange={(e) => setAssigneeId(e.target.value || null)} className="mt-1 block w-full form-select">
              <option value="">Unassigned</option>
              {teamMembers.map(user => <option key={user.id} value={user.id}>{user.full_name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="editTaskStatus" className="block text-sm font-medium text-neutral-medium">Status</label>
            <select id="editTaskStatus" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="mt-1 block w-full form-select">
              {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="editTaskPercent" className="block text-sm font-medium text-neutral-medium">Percent Complete: {percentComplete}%</label>
            <input type="range" id="editTaskPercent" min="0" max="100" step="5" value={percentComplete} onChange={(e) => setPercentComplete(Number(e.target.value))} className="mt-1 block w-full"/>
          </div>

          {/* Budget and Cost Section */}
          <div className="border-t pt-6 mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-dark">Budget & Cost Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="taskBudget" className="block text-sm font-medium text-neutral-medium">Budgeted Cost (₹)</label>
                    <input type="number" id="taskBudget" value={budgetedCost} onChange={(e) => setBudgetedCost(Number(e.target.value))} className="mt-1 block w-full form-input disabled:bg-gray-100" min="0" disabled={!isManager} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-medium">Approved Spent (₹)</label>
                    <p className="mt-1 text-lg font-semibold p-2 bg-gray-100 rounded-md">₹{(task.spent_cost || 0).toLocaleString()}</p>
                </div>
            </div>

            {task.pending_approval && (
                 <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 space-y-3">
                    <p className="font-bold">Pending Approval</p>
                    <p>A request to add <span className="font-bold text-lg">₹{(task.proposed_spent_cost || 0).toLocaleString()}</span> is awaiting review.</p>
                    {isManager && (
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={handleReject} className="px-4 py-2 text-sm font-medium text-white bg-status-red rounded-md hover:bg-red-700 transition-colors">Reject</button>
                            <button type="button" onClick={handleApprove} className="px-4 py-2 text-sm font-medium text-white bg-status-green rounded-md hover:bg-green-700 transition-colors">Approve</button>
                        </div>
                    )}
                </div>
            )}
            
            {!isManager && !task.pending_approval && (
                <div>
                    <label htmlFor="proposeSpent" className="block text-sm font-medium text-neutral-medium">Submit Amount Spent (₹)</label>
                    <input type="number" id="proposeSpent" value={proposedSpentCostInput} onChange={(e) => setProposedSpentCostInput(Number(e.target.value))} className="mt-1 block w-full form-input" min="0" placeholder="Enter amount to be approved"/>
                    <p className="text-xs text-neutral-medium mt-1">This amount will be submitted for approval by a project manager.</p>
                </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-dark bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-md hover:bg-brand-dark transition-colors">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
