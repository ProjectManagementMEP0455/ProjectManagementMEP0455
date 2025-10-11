import React from 'react';
import { Project } from '../types';
import Card from './ui/Card';

interface ModelsViewProps {
    project: Project;
}

const ModelsView: React.FC<ModelsViewProps> = ({ project }) => {
    return (
        <Card className="p-6">
            <h3 className="text-xl font-semibold">3D Models &amp; Plans for {project.name}</h3>
            <p className="mt-4 text-muted-foreground">This section will be used for viewing and managing 3D models, blueprints, and other design documents. (Content to be added)</p>
        </Card>
    );
};

export default ModelsView;