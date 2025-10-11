import React from 'react';
import { Project } from '../types';
import Card from './ui/Card';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTheme } from '../App';


interface BudgetViewProps {
    project: Project;
}

const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

const getVarianceClass = (variance: number) => {
    if (variance < 0) return 'text-red-400 font-bold';
    if (variance > 0) return 'text-green-400 font-semibold';
    return 'text-muted-foreground';
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
                    background={{ fill: 'hsl(var(--secondary))' }}
                    dataKey="value"
                    cornerRadius={10}
                    fill={color}
                />
                 <text
                    x="50%"
                    y="70%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-3xl font-bold fill-foreground"
                >
                    {`${value.toFixed(0)}%`}
                </text>
            </RadialBarChart>
        </ResponsiveContainer>
        <p className="text-sm font-semibold text-muted-foreground -mt-4">{name}</p>
    </div>
);


const BudgetView: React.FC<BudgetViewProps> = ({ project }) => {
    const { theme } = useTheme();
    const totalBudget = project.budget || 0;
    const totalSpent = project.spent || 0;
    const totalVariance = totalBudget - totalSpent;
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    const totalTaskProgress = project.tasks.reduce((sum, task) => sum + (task.percent_complete || 0), 0);
    const overallProgress = project.tasks.length > 0 ? totalTaskProgress / project.tasks.length : 0;
    
    const chartData = project.tasks
        .filter(task => (task.budgeted_cost || 0) > 0 || (task.spent_cost || 0) > 0)
        .map(task => ({
            name: task.name.length > 20 ? `${task.name.substring(0, 18)}...` : task.name,
            Budgeted: task.budgeted_cost || 0,
            Spent: task.spent_cost || 0,
        }));
        
    const tickColor = theme === 'dark' ? '#A1A1AA' : '#52525B';


    return (
        <div className="space-y-6">
            <Card className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-6">Budget vs. Actuals Analysis</h3>

                <Card className="bg-secondary/50 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
                        <div className="lg:col-span-2">
                            <h4 className="font-bold text-foreground text-lg">Project Financial Summary</h4>
                            <div className="mt-4 space-y-2 text-foreground">
                                <p className="flex justify-between"><span>Total Budget:</span> <span className="font-semibold">{formatCurrency(totalBudget)}</span></p>
                                <p className="flex justify-between"><span>Amount Spent:</span> <span className="font-semibold">{formatCurrency(totalSpent)}</span></p>
                                <p className={`flex justify-between ${getVarianceClass(totalVariance)}`}><span>Variance:</span> <span className="font-semibold">{formatCurrency(totalVariance)}</span></p>
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <GaugeChart value={budgetUtilization} name="Budget Utilized" color="hsl(var(--primary))" />
                        </div>
                        <div className="lg:col-span-1">
                            <GaugeChart value={overallProgress} name="Work Completed" color="#36B37E" />
                        </div>
                    </div>
                </Card>

                <h4 className="text-lg font-semibold text-foreground my-6">Task-wise Breakdown</h4>
                <div className="overflow-x-auto border border-border rounded-lg">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/50 border-b border-border">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-muted-foreground w-1/3">Task Name</th>
                                <th className="p-4 text-sm font-semibold text-muted-foreground w-1/3">Budget vs Spent</th>
                                <th className="p-4 text-sm font-semibold text-muted-foreground text-right">Budgeted</th>
                                <th className="p-4 text-sm font-semibold text-muted-foreground text-right">Spent</th>
                                <th className="p-4 text-sm font-semibold text-muted-foreground text-right">Variance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {project.tasks.map(task => {
                                const budget = task.budgeted_cost || 0;
                                const spent = task.spent_cost || 0;
                                const variance = budget - spent;
                                const spentPercentage = budget > 0 ? (spent / budget) * 100 : 0;
                                
                                return (
                                    <tr key={task.id} className="border-b border-border last:border-b-0 hover:bg-muted">
                                        <td className="p-4 font-medium text-foreground">{task.name}</td>
                                        <td className="p-4">
                                            <div className="w-full bg-secondary h-5 rounded">
                                                <div 
                                                    className={`h-5 rounded ${spent > budget ? 'bg-destructive' : 'bg-primary'}`}
                                                    style={{width: `${Math.min(spentPercentage, 100)}%`}}
                                                    title={`Spent ${spentPercentage.toFixed(0)}% of budget`}
                                                ></div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground text-right">{formatCurrency(budget)}</td>
                                        <td className="p-4 text-foreground text-right font-semibold">{formatCurrency(spent)}</td>
                                        <td className={`p-4 text-right ${getVarianceClass(variance)}`}>
                                            {formatCurrency(variance)}
                                        </td>
                                    </tr>
                                )
                            })}
                            {project.tasks.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-muted-foreground">No tasks found for this project.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Task Cost Visualization</h3>
                {chartData.length > 0 ? (
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} interval={0} angle={-45} textAnchor="end" />
                                <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} tick={{ fontSize: 12, fill: tickColor }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                                    cursor={{fill: 'hsla(var(--primary), 0.1)'}}
                                    formatter={(value: number) => formatCurrency(value)}
                                />
                                <Legend wrapperStyle={{ color: tickColor, paddingTop: '40px' }}/>
                                <Bar dataKey="Budgeted" fill={theme === 'dark' ? '#4C9AFF' : '#A5C8FF'} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Spent" fill={theme === 'dark' ? '#0052CC' : '#0065FF'} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">No task budget data available to visualize.</p>
                )}
            </Card>
        </div>
    );
};

export default BudgetView;
