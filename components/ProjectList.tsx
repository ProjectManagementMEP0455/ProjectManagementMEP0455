import React from 'react';
import { Page, Project, ProjectStatus, Profile, UserRole } from '../types';
import Card from './ui/Card';
import Avatar from './ui/Avatar';

interface ProjectListProps {
  navigateTo: (page: Page, projectId: number) => void;
  projects: Project[];
  userProfile: Profile | null;
}

const statusColors: { [key: string]: string } = {
  [ProjectStatus.Active]: 'bg-blue-500/20 text-blue-300',
  [ProjectStatus.Planning]: 'bg-yellow-500/20 text-yellow-300',
  [ProjectStatus.Completed]: 'bg-green-500/20 text-green-300',
  [ProjectStatus.OnHold]: 'bg-red-500/20 text-red-300',
};

const ProjectCard: React.FC<{ project: Project; onClick: () => void; }> = ({ project, onClick }) => {
    const budget = project.budget || 0;
    const spent = project.spent || 0;
    const progress = budget > 0 ? (spent / budget) * 100 : 0;
    const teamMembers = project.teamMembers || [];

    return (
        <Card className="p-6 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group" onClick={onClick}>
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-primary mb-2">{project.name}</h3>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[project.status]}`}>{project.status}</span>
            </div>
            <p className="text-muted-foreground mb-4 h-12 overflow-hidden text-sm">{project.description}</p>
            
            <div className="mb-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="flex justify-between items-center text-sm">
                <div className="text-muted-foreground">
                    <span className="font-semibold">End Date:</span> {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}
                </div>
                 <div className="flex -space-x-2">
                    {teamMembers.slice(0, 4).map((profile: Profile) => <Avatar key={profile.id} profile={profile} size="md" />)}
                 </div>
            </div>
        </Card>
    );
}

const ProjectList: React.FC<ProjectListProps> = ({ navigateTo, projects, userProfile }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-foreground">Projects</h2>
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