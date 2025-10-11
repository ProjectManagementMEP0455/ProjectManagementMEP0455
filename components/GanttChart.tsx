import React from 'react';
import { Task } from '../types';
import Card from './ui/Card';

interface GanttChartProps {
  tasks: Task[];
  projectStartDate: string;
  projectEndDate:string;
}

const GanttChart: React.FC<GanttChartProps> = ({ tasks, projectStartDate, projectEndDate }) => {
  if (!projectStartDate || !projectEndDate) {
    return (
        <Card className="p-6">
            <h3 className="text-xl font-semibold text-foreground">Project Timeline (Gantt Chart)</h3>
            <p className="text-muted-foreground text-center py-4">Project start and end dates must be set to display the timeline.</p>
        </Card>
    );
  }
  
  const startDate = new Date(projectStartDate);
  const endDate = new Date(projectEndDate);
  const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  
  const today = new Date();
  const todayOffsetDays = (today.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
  const todayPosition = (todayOffsetDays / totalDays) * 100;

  const getTaskPosition = (task: Task) => {
    if (!task.start_date || !task.due_date) return { left: '0%', width: '0%' };
    
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.due_date); 
    
    const effectiveTaskStart = taskStart < startDate ? startDate : taskStart;
    
    const durationDays = Math.max(1, (taskEnd.getTime() - effectiveTaskStart.getTime()) / (1000 * 3600 * 24));
    const offsetDays = (effectiveTaskStart.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    
    const left = (offsetDays / totalDays) * 100;
    const width = (durationDays / totalDays) * 100;

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
          <div key={currentDate.toString()} style={{ left: `${left}%` }} className="absolute h-full border-l border-border">
             <span className="absolute -top-5 text-xs text-muted-foreground">{currentDate.toLocaleString('default', { month: 'short' })}</span>
          </div>
        );
      }
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    return markers;
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold text-foreground mb-6">Project Timeline (Gantt Chart)</h3>
      <div className="space-y-3 relative pt-6 overflow-x-auto">
        {/* Timeline Header */}
        <div className="relative h-6" style={{width: '100%'}}>
          <div className="h-full border-b border-border">
            {renderMonthMarkers()}
          </div>
        </div>

        {/* Task Rows */}
        <div className="relative">
             {/* Today Marker */}
            {todayPosition >= 0 && todayPosition <= 100 && (
                 <div style={{ left: `${todayPosition}%` }} className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10" title={`Today: ${today.toLocaleDateString()}`}>
                    <div className="absolute -top-5 -translate-x-1/2 bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">TODAY</div>
                 </div>
            )}
            
            {tasks.map((task, index) => (
              <div key={task.id} className="flex items-center h-12">
                <div className="w-1/4 pr-4 truncate text-sm font-medium text-foreground flex-shrink-0">{task.name}</div>
                <div className="w-3/4 h-8 bg-secondary rounded-md relative flex-grow">
                  <div
                    className="absolute bg-primary/30 h-8 rounded-md flex items-center justify-start"
                    style={getTaskPosition(task)}
                    title={`${task.name} \nStart: ${task.start_date} \nDue: ${task.due_date} \nProgress: ${task.percent_complete || 0}%`}
                  >
                    <div 
                        className="bg-primary h-8 rounded-md" 
                        style={{width: `${task.percent_complete || 0}%`}}>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
         {tasks.length === 0 && <p className="text-muted-foreground text-center py-4">No tasks to display in the timeline.</p>}
      </div>
    </Card>
  );
};

export default GanttChart;