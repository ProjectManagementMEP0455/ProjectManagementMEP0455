
import React from 'react';
import { Project } from '../types';
import Card from './ui/Card';

interface ResourceViewProps {
    project: Project;
}

const ResourceView: React.FC<ResourceViewProps> = ({ project }) => {
    return (
        <Card>
            <h3 className="text-xl font-semibold">Resource Management for {project.name}</h3>
            <p className="mt-4 text-neutral-medium">This section will display resource allocation, including personnel, equipment, and materials. (Content to be added)</p>
        </Card>
    );
};

export default ResourceView;
