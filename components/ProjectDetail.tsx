import React, { useState } from 'react';
import { Project, Task } from '../types';
import KanbanBoard from './KanbanBoard';
import GanttChart from './GanttChart';
import Card from './ui/Card';
import { MOCK_USERS } from '../constants';
import Avatar from './ui/Avatar';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import AddTaskModal from './AddTaskModal';

interface ProjectDetailProps {
  project: Project;
}

type Tab = 'overview' | 'tasks' | 'schedule' | 'budget' | 'team';

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const [tasks, setTasks] = useState<Task[]>(project.tasks);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  
  const teamMembers = MOCK_USERS.filter(u => project.teamMemberIds.includes(u.id));

  const budgetData = [
    { name: 'Spent', value: project.spent, color: '#0052CC' },
    { name: 'Remaining', value: project.budget - project.spent, color: '#B3D4FF' },
  ];
  
  const handleAddTask = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
    // In a real app, you would also make an API call here to save the task.
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 space-y-6">
                <Card>
                    <h3 className="text-xl font-semibold mb-2 text-neutral-dark">Project Description</h3>
                    <p className="text-neutral-medium">{project.description}</p>
                </Card>
                <Card>
                    <h3 className="text-xl font-semibold mb-4 text-neutral-dark">Key Milestones</h3>
                    <ul className="space-y-3">
                        {project.milestones.map(m => (
                            <li key={m.id} className="flex items-center">
                                <input type="checkbox" checked={m.completed} readOnly className="h-5 w-5 rounded text-brand-primary focus:ring-brand-secondary" />
                                <span className={`ml-3 ${m.completed ? 'line-through text-neutral-medium' : 'text-neutral-dark'}`}>{m.name}</span>
                                <span className="ml-auto text-sm text-neutral-medium">{new Date(m.date).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
             </div>
             <div className="space-y-6">
                <Card>
                    <h3 className="text-xl font-semibold mb-2 text-neutral-dark">Project Info</h3>
                    <div className="text-sm space-y-2 text-neutral-dark">
                        <p><strong>Status:</strong> {project.status}</p>
                        <p><strong>Start Date:</strong> {new Date(project.startDate).toLocaleDateString()}</p>
                        <p><strong>End Date:</strong> {new Date(project.endDate).toLocaleDateString()}</p>
                        <p><strong>Budget:</strong> ₹{project.budget.toLocaleString('en-IN')}</p>
                        <p><strong>Spent:</strong> ₹{project.spent.toLocaleString('en-IN')}</p>
                    </div>
                </Card>
                 <Card>
                    <h3 className="text-xl font-semibold mb-4 text-neutral-dark">Team Members</h3>
                    <ul className="space-y-3">
                        {teamMembers.map(user => (
                            <li key={user.id} className="flex items-center space-x-3">
                                <Avatar user={user} />
                                <div>
                                    <p className="font-medium text-neutral-dark">{user.name}</p>
                                    <p className="text-sm text-neutral-medium">{user.role}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
             </div>
          </div>
        );
      case 'tasks':
        return <KanbanBoard tasks={tasks} onOpenAddTaskModal={() => setIsAddTaskModalOpen(true)} />;
      case 'schedule':
        const projectForGantt = { ...project, tasks };
        return <GanttChart project={projectForGantt} />;
      case 'budget':
        return (
            <Card>
                <h3 className="text-xl font-semibold mb-4 text-neutral-dark">Budget Overview</h3>
                <div className="flex items-center justify-around">
                     <div className="text-center">
                        <p className="text-lg text-neutral-medium">Total Budget</p>
                        <p className="text-4xl font-bold text-neutral-dark">₹{project.budget.toLocaleString('en-IN')}</p>
                     </div>
                      <div className="text-center">
                        <p className="text-lg text-neutral-medium">Amount Spent</p>
                        <p className="text-4xl font-bold text-brand-primary">₹{project.spent.toLocaleString('en-IN')}</p>
                     </div>
                      <div className="text-center">
                        <p className="text-lg text-neutral-medium">Remaining</p>
                        <p className={`text-4xl font-bold ${project.budget - project.spent < 0 ? 'text-status-red' : 'text-status-green'}`}>₹{(project.budget - project.spent).toLocaleString('en-IN')}</p>
                     </div>
                </div>
                <ResponsiveContainer width="100%" height={300} className="mt-8">
                    <PieChart>
                        <Pie data={budgetData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} label>
                            {budgetData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${new Intl.NumberFormat('en-IN').format(Number(value))}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
        );
      case 'team':
        return <Card>Team content goes here...</Card>;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ label: string; value: Tab; }> = ({ label, value }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`px-4 py-2 font-semibold text-sm rounded-md transition-colors ${
        activeTab === value ? 'bg-brand-primary text-white' : 'text-neutral-medium hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-neutral-dark">{project.name}</h2>
      
      <div className="flex space-x-2 border-b border-gray-200 pb-2">
        <TabButton label="Overview" value="overview" />
        <TabButton label="Tasks" value="tasks" />
        <TabButton label="Schedule" value="schedule" />
        <TabButton label="Budget" value="budget" />
        <TabButton label="Team" value="team" />
      </div>

      <div>{renderTabContent()}</div>
      
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </div>
  );
};

export default ProjectDetail;