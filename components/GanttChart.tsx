
import React from 'react';
import { Project } from '../types';
import Card from './ui/Card';

interface GanttChartProps {
  project: Project;
}

const GanttChart: React.FC<GanttChartProps> = ({ project }) => {
  const projectStartDate = new Date(project.startDate);
  const projectEndDate = new Date(project.endDate);
  
  const totalDurationDays = (projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 3600 * 24);

  const getTaskPosition = (taskStartDateStr: string, taskEndDateStr: string) => {
    const taskStartDate = new Date(taskStartDateStr);
    const taskEndDate = new Date(taskEndDateStr);
    
    const offsetDays = (taskStartDate.getTime() - projectStartDate.getTime()) / (1000 * 3600 * 24);
    const durationDays = (taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 3600 * 24);
    
    const left = (offsetDays / totalDurationDays) * 100;
    const width = (durationDays / totalDurationDays) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };
  
  // Create month markers
  const monthMarkers = [];
  let currentDate = new Date(projectStartDate);
  while(currentDate <= projectEndDate) {
      const offsetDays = (currentDate.getTime() - projectStartDate.getTime()) / (1000 * 3600 * 24);
      const left = (offsetDays / totalDurationDays) * 100;
      monthMarkers.push({
          name: currentDate.toLocaleString('default', { month: 'short' }),
          left: `${left}%`
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return (
    <Card>
      <h3 className="text-xl font-semibold mb-6 text-neutral-dark">Project Schedule (Gantt View)</h3>
      <div className="relative">
        {/* Month Markers */}
        <div className="relative h-6 flex mb-2 border-b-2 border-gray-200">
            {monthMarkers.map(marker => (
                <div key={marker.name} style={{left: marker.left}} className="absolute text-sm font-semibold text-gray-500">
                    {marker.name}
                </div>
            ))}
        </div>
        
        {/* Tasks */}
        <div className="space-y-2">
            {project.tasks.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map((task, index) => {
                // Assuming task start date is 2 weeks before due date for this mock
                const taskStartDate = new Date(task.dueDate);
                taskStartDate.setDate(taskStartDate.getDate() - 14);

                const { left, width } = getTaskPosition(taskStartDate.toISOString(), task.dueDate);
                
                return (
                    <div key={task.id} className="flex items-center group">
                       <div className="w-1/4 pr-4 text-sm font-medium text-neutral-dark truncate">{task.title}</div>
                       <div className="w-3/4 h-8 relative bg-gray-200 rounded">
                           <div 
                                style={{ left, width }}
                                className="absolute h-full bg-brand-primary rounded transition-all duration-300 group-hover:bg-brand-dark"
                                title={`${task.title} (Due: ${new Date(task.dueDate).toLocaleDateString()})`}
                            >
                           </div>
                       </div>
                    </div>
                );
            })}
        </div>
      </div>
    </Card>
  );
};

export default GanttChart;
