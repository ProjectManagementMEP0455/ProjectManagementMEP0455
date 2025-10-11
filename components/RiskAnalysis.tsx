import React, { useState } from 'react';
import { Project } from '../types';
import Card from './ui/Card';
import { ai } from '../lib/geminiClient';
import Button from './ui/Button';

interface RiskAnalysisProps {
    project?: Project;
    projects?: Project[];
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground">
            {content.split('\n').map((line, index) => {
                if (line.startsWith('### ')) {
                    return <h3 key={index} className="text-md font-bold mt-3 mb-1">{line.substring(4)}</h3>;
                }
                if (line.startsWith('## ')) {
                    return <h2 key={index} className="text-lg font-bold mt-4 mb-2">{line.substring(3)}</h2>;
                }
                if (line.startsWith('# ')) {
                    return <h1 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
                }
                if (line.startsWith('* ')) {
                    return <li key={index} className="ml-4 list-disc">{line.substring(2)}</li>;
                }
                 if (line.trim() === '') {
                    return <br key={index} />;
                }
                return <p key={index}>{line}</p>;
            })}
        </div>
    );
};


const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ project, projects }) => {
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState('');
    const [error, setError] = useState('');

    const isPortfolioAnalysis = !project && projects;

    const generatePrompt = () => {
        if (isPortfolioAnalysis) {
            const projectsOverBudget = projects.filter(p => (p.spent || 0) > (p.budget || 0));
            const lateTasks = projects.flatMap(p => p.tasks).filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Done');

            return `
                You are an expert MEP (Mechanical, Electrical, Plumbing) project management consultant reviewing a project portfolio.
                Analyze the following portfolio data and provide a high-level risk analysis.
                Identify systemic risks, common issues across projects, and the overall portfolio health concerning budget, schedule, and resource allocation.
                Suggest 3-5 strategic, actionable recommendations for the management team to improve project outcomes.
                Format your response in clear sections using Markdown. Start with a main "## Portfolio Risk Analysis" heading.

                **Portfolio Snapshot:**
                - Total Projects: ${projects.length}
                - Projects Over Budget: ${projectsOverBudget.length}
                - Total Tasks Past Due: ${lateTasks.length}

                **Individual Project Summaries:**
                ${projects.slice(0, 10).map(p => `
                - Project: ${p.name}
                  - Status: ${p.status}
                  - Budget vs Spent: ₹${(p.budget || 0).toLocaleString()} / ₹${(p.spent || 0).toLocaleString()}
                  - Tasks: ${p.tasks.length} total, ${p.tasks.filter(t => t.status !== 'Done').length} incomplete.
                `).join('')}
            `;
        } else if (project) {
            return `
                You are an expert MEP (Mechanical, Electrical, Plumbing) project management consultant.
                Analyze the following single project's data and provide a detailed risk analysis.
                Identify the top 3-5 potential risks related to its budget, schedule, resources, and quality.
                For each risk, describe its potential impact and suggest a specific, actionable mitigation strategy.
                Format your response in clear sections using Markdown. Start with a main "## Project Risk Analysis" heading.

                **Project Data:**
                - Project Name: ${project.name}
                - Description: ${project.description}
                - Status: ${project.status}
                - Start Date: ${project.start_date}
                - End Date: ${project.end_date}
                - Budget: ₹${(project.budget || 0).toLocaleString()}
                - Spent: ₹${(project.spent || 0).toLocaleString()}

                **Tasks (${project.tasks.length} total):**
                ${project.tasks.map(t => `- ${t.name} (Status: ${t.status}, Due: ${t.due_date}, Progress: ${t.percent_complete || 0}%)`).join('\n')}

                **Milestones (${project.milestones.length} total):**
                ${project.milestones.map(m => `- ${m.name} (Due: ${m.due_date}, Completed: ${m.completed})`).join('\n')}
            `;
        }
        return '';
    };

    const handleAnalyze = async () => {
        const prompt = generatePrompt();
        if (!prompt) {
            setError('No project data available to analyze.');
            return;
        }

        setLoading(true);
        setError('');
        setAnalysis('');
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setAnalysis(response.text);
        } catch (err: any) {
            setError('Failed to generate analysis. Please ensure your Gemini API key is configured correctly.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const title = isPortfolioAnalysis ? 'AI-Powered Portfolio Risk Analysis' : `AI-Powered Risk Analysis for ${project.name}`;
    const buttonText = isPortfolioAnalysis ? 'Analyze Portfolio Risks' : 'Analyze Project Risks';

    return (
        <Card className="p-6">
            <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Leverage AI to identify potential issues and get mitigation strategies.</p>
                </div>
                <Button 
                    onClick={handleAnalyze} 
                    disabled={loading}
                    variant="primary"
                    className="whitespace-nowrap"
                >
                    {loading ? 'Analyzing...' : buttonText}
                </Button>
            </div>
            
            {error && <div className="mt-4 p-3 bg-red-500/20 text-red-300 rounded-md">{error}</div>}

            {loading && (
                <div className="mt-4 text-center p-8">
                    <div className="flex justify-center items-center space-x-2">
                        <div className="w-4 h-4 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                        <div className="w-4 h-4 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                        <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-muted-foreground mt-4">AI is analyzing the data... this may take a moment.</p>
                </div>
            )}
            
            {analysis && (
                <div className="mt-6 border-t border-border pt-4">
                    <MarkdownRenderer content={analysis} />
                </div>
            )}
        </Card>
    );
};

export default RiskAnalysis;