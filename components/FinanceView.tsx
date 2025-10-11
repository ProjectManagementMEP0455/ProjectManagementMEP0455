import React, { useState, useEffect, FormEvent } from 'react';
import { Project, Profile, UserRole, Request, Expense, Task, RequestStatus, Material, Milestone } from '../types';
import Card from './ui/Card';
import { supabase } from '../lib/supabaseClient';
import Button from './ui/Button';
import Input from './ui/Input';

interface FinanceViewProps {
    project: Project;
    userProfile: Profile | null;
    onUpdateProject: (updatedProject: Project) => void;
}

const statusColors: { [key in RequestStatus]: string } = {
    [RequestStatus.Pending]: 'bg-yellow-500/20 text-yellow-300',
    [RequestStatus.Approved]: 'bg-blue-500/20 text-blue-300',
    [RequestStatus.Rejected]: 'bg-red-500/20 text-red-300',
    [RequestStatus.Processed]: 'bg-green-500/20 text-green-300',
};

const FinanceView: React.FC<FinanceViewProps> = ({ project, userProfile, onUpdateProject }) => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);

    const [newRequestDesc, setNewRequestDesc] = useState('');
    const [newRequestCost, setNewRequestCost] = useState('');
    const [newRequestFile, setNewRequestFile] = useState<File | null>(null);
    const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

    const [newExpenseDesc, setNewExpenseDesc] = useState('');
    const [newExpenseAmount, setNewExpenseAmount] = useState('');
    const [newExpenseDate, setNewExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [newExpenseTaskId, setNewExpenseTaskId] = useState('');
    const [newExpenseFile, setNewExpenseFile] = useState<File | null>(null);
    const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

    const canCreateRequest = userProfile && [UserRole.ProjectManager, UserRole.SiteEngineerTechnician, UserRole.EngineerSupervisor, UserRole.AssistantProjectManager].includes(userProfile.role);
    const canManageFinances = userProfile && [UserRole.OfficeAccountant, UserRole.Admin].includes(userProfile.role);

    const fetchData = async () => {
        setLoading(true);
        try {
            const reqPromise = supabase
                .from('requests')
                .select('*, requester:requested_by(full_name)')
                .eq('project_id', project.id)
                .order('created_at', { ascending: false });
            
            const expPromise = supabase
                .from('expenses')
                .select('*, task:task_id(name), creator:created_by(full_name)')
                .eq('project_id', project.id)
                .order('expense_date', { ascending: false });
            
            const matPromise = supabase
                .from('materials_master')
                .select('*')
                .order('name');

            const [
                { data: reqData, error: reqError }, 
                { data: expData, error: expError },
                { data: matData, error: matError }
            ] = await Promise.all([reqPromise, expPromise, matPromise]);

            if (reqError) throw reqError;
            setRequests(reqData as any[]);
            if (expError) throw expError;
            setExpenses(expData as any[]);
            if (matError) throw matError;
            setMaterials(matData);

        } catch (error: any) {
            console.error("Error fetching finance data:", error);
            alert("Could not fetch financial data: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [project.id]);

    const handleRequestSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!newRequestDesc || !newRequestCost || !userProfile) return;
        setIsSubmittingRequest(true);

        let documentUrl: string | null = null;
        if (newRequestFile) {
            const fileExt = newRequestFile.name.split('.').pop();
            const fileName = `req-${project.id}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('request-attachments').upload(fileName, newRequestFile);
            if(uploadError) {
                alert('Error uploading attachment: ' + uploadError.message);
                setIsSubmittingRequest(false);
                return;
            }
            const { data: urlData } = supabase.storage.from('request-attachments').getPublicUrl(fileName);
            documentUrl = urlData.publicUrl;
        }

        const { data, error } = await supabase
            .from('requests')
            .insert({
                project_id: project.id,
                requested_by: userProfile.id,
                description: newRequestDesc,
                estimated_cost: parseFloat(newRequestCost),
                status: RequestStatus.Pending,
                document_url: documentUrl
            })
            .select('*, requester:requested_by(full_name)')
            .single();

        if (error) {
            alert("Error creating request: " + error.message);
        } else if (data) {
            setRequests([data as any, ...requests]);
            setNewRequestDesc('');
            setNewRequestCost('');
            setNewRequestFile(null);
            (e.target as HTMLFormElement).reset();
        }
        setIsSubmittingRequest(false);
    };

    const handleRequestUpdate = async (requestId: number, status: RequestStatus) => {
        const { data, error } = await supabase
            .from('requests')
            .update({ status: status, reviewed_by: userProfile?.id })
            .eq('id', requestId)
            .select('*, requester:requested_by(full_name)')
            .single();
        if (error) {
            alert('Error updating request: ' + error.message)
        } else if (data) {
            setRequests(requests.map(r => r.id === requestId ? data as any : r));
        }
    };
    
    const handleExpenseSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!newExpenseDesc || !newExpenseAmount || !newExpenseTaskId || !userProfile) {
            alert("Please fill all expense fields.");
            return;
        }

        setIsSubmittingExpense(true);
        let documentUrl = null;

        if (newExpenseFile) {
            const fileExt = newExpenseFile.name.split('.').pop();
            const fileName = `exp-${project.id}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('invoices').upload(fileName, newExpenseFile);

            if (uploadError) {
                alert('Error uploading document: ' + uploadError.message);
                setIsSubmittingExpense(false);
                return;
            }
            
            const { data: urlData } = supabase.storage.from('invoices').getPublicUrl(fileName);
            documentUrl = urlData.publicUrl;
        }
        
        const { error } = await supabase.from('expenses').insert({
            project_id: project.id,
            task_id: parseInt(newExpenseTaskId),
            created_by: userProfile.id,
            description: newExpenseDesc,
            amount: parseFloat(newExpenseAmount),
            expense_date: newExpenseDate,
            document_url: documentUrl
        });

        if (error) {
            alert("Error creating expense: " + error.message);
        } else {
            const { data: updatedProjects, error: refreshError } = await supabase
                .from('projects')
                .select('*, tasks(*), milestones(*), project_team_members(*, profile:profiles(*))')
                .eq('id', project.id);
            
            if (refreshError) {
                 alert('Error refreshing project data: ' + refreshError.message);
            } else if (updatedProjects && updatedProjects.length > 0) {
                const updatedProjectData = updatedProjects[0];
                const formattedProject = {
                    ...updatedProjectData,
                    teamMembers: (updatedProjectData.project_team_members || []).map((ptm: any) => ptm.profile).filter(Boolean),
                    tasks: updatedProjectData.tasks as Task[],
                    milestones: updatedProjectData.milestones as Milestone[]
                };
                onUpdateProject(formattedProject as Project);
            }
            await fetchData();
            setNewExpenseDesc('');
            setNewExpenseAmount('');
            setNewExpenseTaskId('');
            setNewExpenseFile(null);
            (e.target as HTMLFormElement).reset();
        }
        setIsSubmittingExpense(false);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Material/Expense Requests</h3>
                {canCreateRequest && (
                    <form onSubmit={handleRequestSubmit} className="p-4 bg-secondary/50 rounded-lg mb-6 space-y-3">
                        <h4 className="font-semibold">Create New Request</h4>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Input type="text" list="materials-list" value={newRequestDesc} onChange={e => setNewRequestDesc(e.target.value)} required placeholder="e.g., 50 bags of cement" />
                            <datalist id="materials-list">
                                {materials.map(m => <option key={m.id} value={m.name} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Estimated Cost (₹)</label>
                            <Input type="number" value={newRequestCost} onChange={e => setNewRequestCost(e.target.value)} required placeholder="25000" />
                        </div>
                         <div>
                            <label className="text-sm font-medium">Attach Reference (Optional)</label>
                            <Input type="file" onChange={e => setNewRequestFile(e.target.files ? e.target.files[0] : null)} />
                         </div>
                        <Button type="submit" disabled={isSubmittingRequest} variant="primary" className="w-full">
                            {isSubmittingRequest ? "Submitting..." : "Submit Request"}
                        </Button>
                    </form>
                )}
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {requests.map(req => (
                        <div key={req.id} className="p-3 border border-border rounded-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{req.description}</p>
                                    <p className="text-sm text-muted-foreground">By: {req.requester?.full_name || '...'} on {new Date(req.created_at).toLocaleDateString()}</p>
                                    <p className="text-sm text-foreground font-bold">Est. Cost: ₹{req.estimated_cost.toLocaleString()}</p>
                                     {req.document_url && <a href={req.document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline font-semibold">View Attachment</a>}
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[req.status]}`}>{req.status}</span>
                            </div>
                            {canManageFinances && req.status === 'Pending' && (
                                <div className="flex justify-end space-x-2 mt-2">
                                    <Button onClick={() => handleRequestUpdate(req.id, RequestStatus.Rejected)} size="sm" variant="destructive">Reject</Button>
                                    <Button onClick={() => handleRequestUpdate(req.id, RequestStatus.Approved)} size="sm" className="bg-green-500 hover:bg-green-600">Approve</Button>
                                </div>
                            )}
                        </div>
                    ))}
                    {requests.length === 0 && <p className="text-muted-foreground text-center">No requests yet.</p>}
                </div>
            </Card>
            <Card className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Logged Expenses</h3>
                {canManageFinances && (
                     <form onSubmit={handleExpenseSubmit} className="p-4 bg-secondary/50 rounded-lg mb-6 space-y-3">
                         <h4 className="font-semibold">Add New Expense</h4>
                         <div><label className="text-sm font-medium">Description</label><Input type="text" value={newExpenseDesc} onChange={e => setNewExpenseDesc(e.target.value)} required /></div>
                         <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-sm font-medium">Amount (₹)</label><Input type="number" value={newExpenseAmount} onChange={e => setNewExpenseAmount(e.target.value)} required /></div>
                             <div><label className="text-sm font-medium">Expense Date</label><Input type="date" value={newExpenseDate} onChange={e => setNewExpenseDate(e.target.value)} required /></div>
                         </div>
                         <div>
                             <label className="text-sm font-medium">Link to Task</label>
                             <select value={newExpenseTaskId} onChange={e => setNewExpenseTaskId(e.target.value)} required className="mt-1 block w-full bg-input border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-ring">
                                 <option value="">Select a task...</option>
                                 {project.tasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                             </select>
                         </div>
                          <div>
                            <label className="text-sm font-medium">Attach Invoice/Receipt (Optional)</label>
                            <Input type="file" onChange={e => setNewExpenseFile(e.target.files ? e.target.files[0] : null)} />
                         </div>
                         <Button type="submit" disabled={isSubmittingExpense} variant="primary" className="w-full">{isSubmittingExpense ? "Submitting..." : "Add Expense"}</Button>
                     </form>
                )}
                 <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                     {expenses.map(exp => (
                         <div key={exp.id} className="p-3 border border-border rounded-md text-sm">
                              <p className="font-semibold text-foreground">₹{exp.amount.toLocaleString()}: <span className="font-normal">{exp.description}</span></p>
                              <p className="text-muted-foreground">Task: {exp.task?.name || 'N/A'} | Date: {new Date(exp.expense_date).toLocaleDateString()}</p>
                              {exp.document_url && <a href={exp.document_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">View Document</a>}
                         </div>
                     ))}
                     {expenses.length === 0 && <p className="text-muted-foreground text-center">No expenses logged yet.</p>}
                 </div>
            </Card>
        </div>
    );
};

export default FinanceView;