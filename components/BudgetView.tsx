import React from 'react';
import { Project } from '../types';
import Card from './ui/Card';

interface BudgetViewProps {
    project: Project;
}

const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

const getVarianceClass = (variance: number) => {
    if (variance < 0) return 'text-status-red font-bold';
    if (variance > 0) return 'text-status-green font-semibold';
    return 'text-neutral-medium';
};

const BudgetStatCard: React.FC<{ title: string; value: string; className?: string }> = ({ title, value, className }) => (
    <div className="bg-gray-50 p-4 rounded-lg text-center">
        <p className="text-sm text-neutral-medium">{title}</p>
        <p className={`text-2xl font-bold ${className || 'text-neutral-dark'}`}>{value}</p>
    </div>
);

const BudgetView: React.FC<BudgetViewProps> = ({ project }) => {
    const totalBudget = project.budget || 0;
    const totalSpent = project.spent || 0;
    const totalVariance = totalBudget - totalSpent;
    const totalVariancePercentage = totalBudget > 0 ? (totalVariance / totalBudget) * 100 : 0;

    return (
        <Card>
            <h3 className="text-xl font-semibold text-neutral-dark mb-6">Budget vs. Actuals Analysis</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <BudgetStatCard title="Total Project Budget" value={formatCurrency(totalBudget)} />
                <BudgetStatCard title="Total Amount Spent" value={formatCurrency(totalSpent)} />
                <BudgetStatCard 
                    title="Overall Variance" 
                    value={formatCurrency(totalVariance)} 
                    className={getVarianceClass(totalVariance)}
                />
                 <BudgetStatCard 
                    title="Variance %" 
                    value={`${totalVariancePercentage.toFixed(2)}%`}
                    className={getVarianceClass(totalVariance)}
                />
            </div>

            <h4 className="text-lg font-semibold text-neutral-dark mb-4">Task-wise Breakdown</h4>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-neutral-medium">Task Name</th>
                            <th className="p-4 text-sm font-semibold text-neutral-medium text-right">Budgeted Cost</th>
                            <th className="p-4 text-sm font-semibold text-neutral-medium text-right">Amount Spent</th>
                            <th className="p-4 text-sm font-semibold text-neutral-medium text-right">Variance</th>
                            <th className="p-4 text-sm font-semibold text-neutral-medium text-right">Variance %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {project.tasks.map(task => {
                            const budget = task.budgeted_cost || 0;
                            const spent = task.spent_cost || 0;
                            const variance = budget - spent;
                            const variancePercentage = budget > 0 ? (variance / budget) * 100 : 0;
                            
                            return (
                                <tr key={task.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                    <td className="p-4 font-medium text-neutral-dark">{task.name}</td>
                                    <td className="p-4 text-neutral-medium text-right">{formatCurrency(budget)}</td>
                                    <td className="p-4 text-neutral-dark text-right font-semibold">{formatCurrency(spent)}</td>
                                    <td className={`p-4 text-right ${getVarianceClass(variance)}`}>
                                        {formatCurrency(variance)}
                                    </td>
                                    <td className={`p-4 text-right ${getVarianceClass(variance)}`}>
                                        {variancePercentage.toFixed(2)}%
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
