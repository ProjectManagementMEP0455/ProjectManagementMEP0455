
import React from 'react';
import { Project } from '../types';
import Card from './ui/Card';

interface RiskAnalysisProps {
    project: Project;
}

const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ project }) => {
    return (
        <Card>
            <h3 className="text-xl font-semibold">Risk Analysis for {project.name}</h3>
            <p className="mt-4 text-neutral-medium">This section will display potential project risks, their probability, impact, and mitigation strategies. (Content to be added)</p>
        </Card>
    );
};

export default RiskAnalysis;
