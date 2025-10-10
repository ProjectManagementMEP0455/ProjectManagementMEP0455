
import React from 'react';
import { Page, Project, ProjectStatus, Profile, UserRole } from '../types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';

interface ProjectListProps {
  navigateTo: (page: Page, projectId: number) => void;
  projects: Project[];
  onOpenAddProjectModal: () => void;
  userProfile: Profile | null;
}

const statusColors: { [key: string]: string } = {
  [ProjectStatus.Active]: 'bg-status-blue text-white',
  [ProjectStatus.Planning]: 'bg-status-yellow text-neutral-dark',
  [ProjectStatus.Completed]: 'bg-status-green text-white',
  [ProjectStatus.OnHold]: 'bg-status-red text-white',
};

const ProjectCard: React.FC<{ project: Project; onClick: () => void; }> = ({ project, onClick }) => {
    const budget = project.budget || 0;
    const spent = project.spent || 0;
    const progress = budget > 0 ? (spent / budget) * 100 : 0;
    const teamMembers = project.teamMembers || [];

    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-brand-primary mb-2">{project.name}</h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[project.status]}`}>{project.status}</span>
            </div>
            <p className="text-neutral-medium mb-4 h-12 overflow-hidden">{project.description}</p>
            
            <div className="mb-4">
                <div className="flex justify-between text-sm text-neutral-medium mb-1">
                    <span>Progress</span>
                    <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="flex justify-between items-center text-sm">
                <div className="text-neutral-medium">
                    <span className="font-semibold">End Date:</span> {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                </div>
                 <div className="flex -space-x-2">
                    {teamMembers.map((profile: Profile) => <Avatar key={profile.id} profile={profile} size="md" />)}
                 </div>
            </div>
        </Card>
    );
}

const ProjectList: React.FC<ProjectListProps> = ({ navigateTo, projects, onOpenAddProjectModal, userProfile }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-neutral-dark">Projects</h2>
        {userProfile?.role === UserRole.ProjectDirector && (
          <button 
            onClick={onOpenAddProjectModal}
            className="bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors">
            Create New Project
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} onClick={() => navigateTo(Page.ProjectDetail, project.id)} />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
