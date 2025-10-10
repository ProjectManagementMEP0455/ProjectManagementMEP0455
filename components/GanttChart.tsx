import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Project, Task } from '../types';
import Card from './ui/Card';

interface GanttChartProps {
  project: Project;
}

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const GanttChart: React.FC<GanttChartProps> = ({ project }) => {
  const [tasks, setTasks] = useState(() => [...project.tasks].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
  const [draggingInfo, setDraggingInfo] = useState<{
    taskId: string;
    type: 'drag' | 'resize-left' | 'resize-right';
    initialMouseX: number;
    initialTask: Task;
    pixelsPerDay: number;
  } | null>(null);

  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const taskElementsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const projectStartDate = new Date(project.startDate);
  const projectEndDate = new Date(project.endDate);
  const totalDurationDays = Math.max(1, (projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 3600 * 24));

  const getTaskPosition = (taskStartDateStr: string, taskEndDateStr: string) => {
    const taskStartDate = new Date(taskStartDateStr);
    const taskEndDate = new Date(taskEndDateStr);
    const offsetDays = (taskStartDate.getTime() - projectStartDate.getTime()) / (1000 * 3600 * 24);
    const durationDays = (taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 3600 * 24);
    const left = (offsetDays / totalDurationDays) * 100;
    const width = (durationDays / totalDurationDays) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  const updateTaskAndDependencies = useCallback((currentTasks: Task[], draggedTaskId: string, newStartDate: Date): Task[] => {
      const tasksMap = new Map(currentTasks.map(t => [t.id, { ...t }]));
      const initialDraggedTask = currentTasks.find(t => t.id === draggedTaskId);
      if (!initialDraggedTask) return currentTasks;

      const deltaMs = newStartDate.getTime() - new Date(initialDraggedTask.startDate).getTime();
      const tasksToUpdate = new Set<string>();
      const queue: string[] = [draggedTaskId];
      
      while(queue.length > 0) {
        const currentId = queue.shift()!;
        if(tasksToUpdate.has(currentId)) continue;
        tasksToUpdate.add(currentId);
        
        currentTasks.forEach(task => {
          if (task.dependencies?.includes(currentId)) {
            queue.push(task.id);
          }
        });
      }

      tasksToUpdate.forEach(id => {
        const task = tasksMap.get(id)!;
        const duration = new Date(task.dueDate).getTime() - new Date(task.startDate).getTime();
        const updatedStartDate = new Date(new Date(task.startDate).getTime() + deltaMs);
        task.startDate = formatDate(updatedStartDate);
        task.dueDate = formatDate(new Date(updatedStartDate.getTime() + duration));
        tasksMap.set(id, task);
      });

      return Array.from(tasksMap.values());
    }, []);

  const updateDependentPositions = useCallback((currentTasks: Task[], parentTaskId: string): Task[] => {
      const tasksMap = new Map(currentTasks.map(t => [t.id, { ...t }]));
      const queue = [parentTaskId];
  
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        const parentTask = tasksMap.get(currentId)!;
        const parentEndDate = new Date(parentTask.dueDate);
  
        for (const task of currentTasks) {
          if (task.dependencies?.includes(currentId)) {
            const childTask = tasksMap.get(task.id)!;
            const childStartDate = new Date(childTask.startDate);
            const newChildStartDate = addDays(parentEndDate, 1);
  
            if (childStartDate < newChildStartDate) {
              const duration = new Date(childTask.dueDate).getTime() - new Date(childTask.startDate).getTime();
              childTask.startDate = formatDate(newChildStartDate);
              childTask.dueDate = formatDate(new Date(newChildStartDate.getTime() + duration));
              tasksMap.set(childTask.id, childTask);
              queue.push(childTask.id);
            }
          }
        }
      }
      return Array.from(tasksMap.values());
    }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, taskId: string, type: 'drag' | 'resize-left' | 'resize-right') => {
    e.preventDefault();
    e.stopPropagation();
    const ganttBarArea = ganttContainerRef.current?.querySelector('.gantt-bars');
    if (!ganttBarArea) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const ganttRect = ganttBarArea.getBoundingClientRect();
    const pixelsPerDay = ganttRect.width / totalDurationDays;

    setDraggingInfo({ taskId, type, initialMouseX: e.clientX, initialTask: { ...task }, pixelsPerDay });
  }, [tasks, totalDurationDays]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingInfo) return;
    const { taskId, type, initialMouseX, initialTask, pixelsPerDay } = draggingInfo;
    const deltaX = e.clientX - initialMouseX;
    const deltaDays = Math.round(deltaX / pixelsPerDay);

    setTasks(currentTasks => {
      if (type === 'drag') {
        const newStartDate = addDays(new Date(initialTask.startDate), deltaDays);
        return updateTaskAndDependencies(currentTasks, taskId, newStartDate);
      }
      
      const newTasks = currentTasks.map(t => ({...t}));
      const taskIndex = newTasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return currentTasks;

      if (type === 'resize-right') {
        const newEndDate = addDays(new Date(initialTask.dueDate), deltaDays);
        if (newEndDate > new Date(newTasks[taskIndex].startDate)) {
          newTasks[taskIndex].dueDate = formatDate(newEndDate);
          return updateDependentPositions(newTasks, taskId);
        }
      } else if (type === 'resize-left') {
        const newStartDate = addDays(new Date(initialTask.startDate), deltaDays);
        if (newStartDate < new Date(newTasks[taskIndex].dueDate)) {
          newTasks[taskIndex].startDate = formatDate(newStartDate);
        }
      }
      return newTasks;
    });
  }, [draggingInfo, updateTaskAndDependencies, updateDependentPositions]);

  const handleMouseUp = useCallback(() => setDraggingInfo(null), []);

  useEffect(() => {
    if (draggingInfo) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingInfo, handleMouseMove, handleMouseUp]);
  
  const monthMarkers = [];
  let currentDate = new Date(projectStartDate);
  while(currentDate <= projectEndDate) {
      const offsetDays = (currentDate.getTime() - projectStartDate.getTime()) / (1000 * 3600 * 24);
      const left = (offsetDays / totalDurationDays) * 100;
      monthMarkers.push({ name: currentDate.toLocaleString('default', { month: 'short' }), left: `${left}%` });
      currentDate.setMonth(currentDate.getMonth() + 1);
  }

  const DependencyLines = () => {
    if (!ganttContainerRef.current) return null;
    const containerRect = ganttContainerRef.current.getBoundingClientRect();

    return <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ top: '2.5rem' }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#5E6C84" />
          </marker>
        </defs>
        {tasks.map(task => task.dependencies?.map(depId => {
            const parentEl = taskElementsRef.current[depId];
            const childEl = taskElementsRef.current[task.id];
            if (!parentEl || !childEl) return null;

            const parentRect = parentEl.getBoundingClientRect();
            const childRect = childEl.getBoundingClientRect();

            const startX = parentRect.right - containerRect.left + 75; // 75 = width of task label column
            const startY = parentRect.top - containerRect.top + parentRect.height / 2 - 40; // ~40 header offset
            const endX = childRect.left - containerRect.left + 75;
            const endY = childRect.top - containerRect.top + childRect.height / 2 - 40;

            return <path key={`${depId}-${task.id}`} d={`M ${startX} ${startY} C ${startX + 30} ${startY}, ${endX - 30} ${endY}, ${endX} ${endY}`} stroke="#5E6C84" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />;
        }))}
      </svg>;
  };

  return (
    <Card>
      <h3 className="text-xl font-semibold mb-6 text-neutral-dark">Project Schedule (Gantt View)</h3>
      <div className="relative" ref={ganttContainerRef}>
        <div className="relative h-6 flex mb-2 border-b-2 border-gray-200">
          <div className="w-1/4"></div> {/* Spacer for labels */}
          <div className="w-3/4 relative">
            {monthMarkers.map(marker => <div key={marker.name} style={{left: marker.left}} className="absolute text-sm font-semibold text-gray-500">{marker.name}</div>)}
          </div>
        </div>
        
        <div className="space-y-2 gantt-bars">
            {tasks.map((task) => {
                const { left, width } = getTaskPosition(task.startDate, task.dueDate);
                return (
                    <div key={task.id} className="flex items-center group h-8">
                       <div className="w-1/4 pr-4 text-sm font-medium text-neutral-dark truncate">{task.title}</div>
                       <div className="w-3/4 h-full relative">
                           {/* FIX: ref callback was implicitly returning a value causing a type error. Switched to a block body to ensure it returns undefined. */}
                           <div ref={el => { taskElementsRef.current[task.id] = el; }} style={{ left, width }} onMouseDown={(e) => handleMouseDown(e, task.id, 'drag')} className="absolute h-full bg-brand-primary rounded transition-all duration-100 group-hover:bg-brand-dark flex items-center justify-between cursor-move">
                            <div onMouseDown={(e) => handleMouseDown(e, task.id, 'resize-left')} className="absolute left-0 top-0 h-full w-2 cursor-ew-resize rounded-l-md opacity-50 hover:opacity-100 bg-brand-dark"></div>
                            <div onMouseDown={(e) => handleMouseDown(e, task.id, 'resize-right')} className="absolute right-0 top-0 h-full w-2 cursor-ew-resize rounded-r-md opacity-50 hover:opacity-100 bg-brand-dark"></div>
                           </div>
                       </div>
                    </div>
                );
            })}
        </div>
        <DependencyLines />
      </div>
    </Card>
  );
};

export default GanttChart;
