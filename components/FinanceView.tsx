
import React, { useState, useEffect, FormEvent } from 'react';
// FIX: Import `Milestone` type from `../types` to resolve `Cannot find name 'Milestone'` error when casting the `milestones` property during project data refresh.
import { Project, Profile, UserRole, Request, Expense, Task, RequestStatus, Material, Milestone } from '../types';
import Card from './ui/Card';
import { supabase } from '../lib/supabaseClient';

interface FinanceViewProps {
    project: Project;
    userProfile: Profile | null;
    onUpdateProject: (updatedProject: Project) => void;
}

const statusColors: { [key in RequestStatus]: string } = {
    [RequestStatus.Pending]: 'bg-status-yellow text-neutral-darkest',
    [RequestStatus.Approved]: 'bg-status-blue text-white',
    [RequestStatus.Rejected]: 'bg-status-red text-white',
    [RequestStatus.Processed]: 'bg-status-green text-white',
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
            await fetchData(); // Refetch finance data for the view
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
            <Card>
                <h3 className="text-xl font-semibold text-neutral-darkest mb-4">Material/Expense Requests</h3>
                {canCreateRequest && (
                    <form onSubmit={handleRequestSubmit} className="p-4 bg-gray-50 rounded-lg mb-6 space-y-3">
                        <h4 className="font-semibold">Create New Request</h4>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <input type="text" list="materials-list" value={newRequestDesc} onChange={e => setNewRequestDesc(e.target.value)} required className="w-full form-input mt-1" placeholder="e.g., 50 bags of cement" />
                            <datalist id="materials-list">
                                {materials.map(m => <option key={m.id} value={m.name} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Estimated Cost (₹)</label>
                            <input type="number" value={newRequestCost} onChange={e => setNewRequestCost(e.target.value)} required className="w-full form-input mt-1" placeholder="25000" />
                        </div>
                         <div>
                            <label className="text-sm font-medium">Attach Reference (Optional)</label>
                            <input type="file" onChange={e => setNewRequestFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm mt-1"/>
                         </div>
                        <button type="submit" disabled={isSubmittingRequest} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50">
                            {isSubmittingRequest ? "Submitting..." : "Submit Request"}
                        </button>
                    </form>
                )}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {requests.map(req => (
                        <div key={req.id} className="p-3 border rounded-md">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold">{req.description}</p>
                                    <p className="text-sm text-neutral-medium">By: {req.requester?.full_name || '...'} on {new Date(req.created_at).toLocaleDateString()}</p>
                                    <p className="text-sm text-neutral-dark font-bold">Est. Cost: ₹{req.estimated_cost.toLocaleString()}</p>
                                     {req.document_url && <a href={req.document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-primary hover:underline font-semibold">View Attachment</a>}
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[req.status]}`}>{req.status}</span>
                            </div>
                            {canManageFinances && req.status === 'Pending' && (
                                <div className="flex justify-end space-x-2 mt-2">
                                    <button onClick={() => handleRequestUpdate(req.id, RequestStatus.Rejected)} className="px-2 py-1 text-xs bg-status-red text-white rounded hover:bg-red-700">Reject</button>
                                    <button onClick={() => handleRequestUpdate(req.id, RequestStatus.Approved)} className="px-2 py-1 text-xs bg-status-green text-white rounded hover:bg-green-700">Approve</button>
                                </div>
                            )}
                        </div>
                    ))}
                    {requests.length === 0 && <p className="text-neutral-medium text-center">No requests yet.</p>}
                </div>
            </Card>
            <Card>
                <h3 className="text-xl font-semibold text-neutral-darkest mb-4">Logged Expenses</h3>
                {canManageFinances && (
                     <form onSubmit={handleExpenseSubmit} className="p-4 bg-gray-50 rounded-lg mb-6 space-y-3">
                         <h4 className="font-semibold">Add New Expense</h4>
                         <div><label className="text-sm font-medium">Description</label><input type="text" value={newExpenseDesc} onChange={e => setNewExpenseDesc(e.target.value)} required className="w-full form-input mt-1" /></div>
                         <div className="grid grid-cols-2 gap-4">
                             <div><label className="text-sm font-medium">Amount (₹)</label><input type="number" value={newExpenseAmount} onChange={e => setNewExpenseAmount(e.target.value)} required className="w-full form-input mt-1" /></div>
                             <div><label className="text-sm font-medium">Expense Date</label><input type="date" value={newExpenseDate} onChange={e => setNewExpenseDate(e.target.value)} required className="w-full form-input mt-1" /></div>
                         </div>
                         <div>
                             <label className="text-sm font-medium">Link to Task</label>
                             <select value={newExpenseTaskId} onChange={e => setNewExpenseTaskId(e.target.value)} required className="w-full form-select mt-1">
                                 <option value="">Select a task...</option>
                                 {project.tasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                             </select>
                         </div>
                          <div>
                            <label className="text-sm font-medium">Attach Invoice/Receipt (Optional)</label>
                            <input type="file" onChange={e => setNewExpenseFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm mt-1"/>
                         </div>
                         <button type="submit" disabled={isSubmittingExpense} className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50">{isSubmittingExpense ? "Submitting..." : "Add Expense"}</button>
                     </form>
                )}
                 <div className="space-y-2 max-h-96 overflow-y-auto">
                     {expenses.map(exp => (
                         <div key={exp.id} className="p-3 border rounded-md text-sm">
                              <p className="font-semibold">₹{exp.amount.toLocaleString()}: <span className="font-normal">{exp.description}</span></p>
                              <p className="text-neutral-medium">Task: {exp.task?.name || 'N/A'} | Date: {new Date(exp.expense_date).toLocaleDateString()}</p>
                              {exp.document_url && <a href={exp.document_url} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline font-semibold">View Document</a>}
                         </div>
                     ))}
                     {expenses.length === 0 && <p className="text-neutral-medium text-center">No expenses logged yet.</p>}
                 </div>
            </Card>
        </div>
    );
};

export default FinanceView;