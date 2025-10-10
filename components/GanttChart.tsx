import React from 'react';
import { Task } from '../types';
import Card from './ui/Card';

interface GanttChartProps {
  tasks: Task[];
  projectStartDate: string;
  projectEndDate: string;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, projectStartDate, projectEndDate }) => {
  if (!projectStartDate || !projectEndDate) {
    return (
        <Card>
            <h3 className="text-xl font-semibold text-neutral-dark">Project Timeline (Gantt Chart)</h3>
            <p className="text-neutral-medium text-center py-4">Project start and end dates must be set to display the timeline.</p>
        </Card>
    );
  }
  
  const startDate = new Date(projectStartDate);
  const endDate = new Date(projectEndDate);
  const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

  const getTaskPosition = (task: Task) => {
    if (!task.due_date) return { left: '0%', width: '0%' };
    
    const taskEnd = new Date(task.due_date); 
    const taskDurationDays = 14; 
    const taskStart = new Date(taskEnd.getTime() - taskDurationDays * 1000 * 3600 * 24);

    const offsetDays = (taskStart.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const left = (offsetDays / totalDays) * 100;
    const width = (taskDurationDays / totalDays) * 100;

    return {
      left: `${Math.max(0, left)}%`,
      width: `${Math.min(100 - Math.max(0, left), width)}%`,
    };
  };
  
  const renderMonthMarkers = () => {
    const markers = [];
    let currentDate = new Date(startDate);
    currentDate.setDate(1);

    while (currentDate <= endDate) {
      const monthStartOffset = (currentDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
      const left = (monthStartOffset / totalDays) * 100;
      if (left >= 0 && left < 100) {
        markers.push(
          <div key={currentDate.toString()} style={{ left: `${left}%` }} className="absolute h-full border-l border-gray-200">
             <span className="absolute -top-5 text-xs text-neutral-medium">{currentDate.toLocaleString('default', { month: 'short' })}</span>
          </div>
        );
      }
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return markers;
  };

  return (
    <Card>
      <h3 className="text-xl font-semibold text-neutral-dark mb-6">Project Timeline (Gantt Chart)</h3>
      <div className="space-y-4 relative pt-6 overflow-x-auto">
        <div className="relative h-6 min-w-full" style={{width: '100%'}}>
          <div className="h-full border-b border-gray-300">
            {renderMonthMarkers()}
          </div>
        </div>

        {tasks.map((task) => (
          <div key={task.id} className="flex items-center h-10 min-w-full">
            <div className="w-1/4 pr-4 truncate text-sm font-medium text-neutral-dark flex-shrink-0">{task.name}</div>
            <div className="w-3/4 bg-gray-100 rounded-full h-6 relative flex-grow">
              <div
                className="absolute bg-brand-primary h-6 rounded-full flex items-center justify-start pl-2"
                style={getTaskPosition(task)}
                title={`${task.name} (Due: ${task.due_date})`}
              >
              </div>
            </div>
          </div>
        ))}
         {tasks.length === 0 && <p className="text-neutral-medium text-center py-4">No tasks to display in the timeline.</p>}
      </div>
    </Card>
  );
};

export default GanttChart;
