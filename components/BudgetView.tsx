import React from 'react';
import { Project } from '../types';
import Card from './ui/Card';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';


interface BudgetViewProps {
    project: Project;
}

const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

const getVarianceClass = (variance: number) => {
    if (variance < 0) return 'text-status-red font-bold';
    if (variance > 0) return 'text-status-green font-semibold';
    return 'text-neutral-medium';
};

const GaugeChart: React.FC<{ value: number, name: string, color: string }> = ({ value, name, color }) => (
    <div style={{ width: '100%', height: 180 }} className="flex flex-col items-center">
        <ResponsiveContainer>
            <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={[{ value: Math.min(value, 100) }]}
                startAngle={180}
                endAngle={0}
                barSize={20}
            >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                    fill={color}
                />
                 <text
                    x="50%"
                    y="70%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-3xl font-bold fill-current text-neutral-darkest"
                >
                    {`${value.toFixed(0)}%`}
                </text>
            </RadialBarChart>
        </ResponsiveContainer>
        <p className="text-sm font-semibold text-neutral-medium -mt-4">{name}</p>
    </div>
);


const BudgetView: React.FC<BudgetViewProps> = ({ project }) => {
    const totalBudget = project.budget || 0;
    const totalSpent = project.spent || 0;
    const totalVariance = totalBudget - totalSpent;
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const totalTaskProgress = project.tasks.reduce((sum, task) => sum + (task.percent_complete || 0), 0);
    const overallProgress = project.tasks.length > 0 ? totalTaskProgress / project.tasks.length : 0;
    

    return (
        <Card>
            <h3 className="text-xl font-semibold text-neutral-darkest mb-6">Budget vs. Actuals Analysis</h3>

            <Card className="bg-neutral-lightest">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-neutral-darkest text-lg">Project Financial Summary</h4>
                        <div className="mt-4 space-y-2 text-neutral-dark">
                            <p className="flex justify-between"><span>Total Budget:</span> <span className="font-semibold">{formatCurrency(totalBudget)}</span></p>
                            <p className="flex justify-between"><span>Amount Spent:</span> <span className="font-semibold">{formatCurrency(totalSpent)}</span></p>
                            <p className={`flex justify-between ${getVarianceClass(totalVariance)}`}><span>Variance:</span> <span className="font-semibold">{formatCurrency(totalVariance)}</span></p>
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                        <GaugeChart value={budgetUtilization} name="Budget Utilized" color="#0052CC" />
                    </div>
                    <div className="lg:col-span-1">
                         <GaugeChart value={overallProgress} name="Work Completed" color="#36B37E" />
                    </div>
                </div>
            </Card>

            <h4 className="text-lg font-semibold text-neutral-darkest my-6">Task-wise Breakdown</h4>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-neutral-medium w-1/3">Task Name</th>
                            <th className="p-4 text-sm font-semibold text-neutral-medium w-1/3">Budget vs Spent</th>
                            <th className="p-4 text-sm font-semibold text-neutral-medium text-right">Budgeted</th>
                            <th className="p-4 text-sm font-semibold text-neutral-medium text-right">Spent</th>
                            <th className="p-4 text-sm font-semibold text-neutral-medium text-right">Variance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {project.tasks.map(task => {
                            const budget = task.budgeted_cost || 0;
                            const spent = task.spent_cost || 0;
                            const variance = budget - spent;
                            const spentPercentage = budget > 0 ? (spent / budget) * 100 : 0;
                            
                            return (
                                <tr key={task.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                    <td className="p-4 font-medium text-neutral-dark">{task.name}</td>
                                    <td className="p-4">
                                        <div className="w-full bg-brand-light h-5 rounded">
                                            <div 
                                                className={`h-5 rounded ${spent > budget ? 'bg-status-red' : 'bg-brand-primary'}`}
                                                style={{width: `${Math.min(spentPercentage, 100)}%`}}
                                                title={`Spent ${spentPercentage.toFixed(0)}% of budget`}
                                            ></div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-neutral-medium text-right">{formatCurrency(budget)}</td>
                                    <td className="p-4 text-neutral-dark text-right font-semibold">{formatCurrency(spent)}</td>
                                    <td className={`p-4 text-right ${getVarianceClass(variance)}`}>
                                        {formatCurrency(variance)}
                                    </td>
                                </tr>
                            )
                        })}
                         {project.tasks.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center p-8 text-neutral-medium">No tasks found for this project.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default BudgetView;