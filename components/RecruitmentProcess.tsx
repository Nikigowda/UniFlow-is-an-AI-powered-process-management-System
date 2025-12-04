import React, { useState } from 'react';
import { Plus, Search, User, Briefcase, Mail, Phone, Calendar } from 'lucide-react';
import { Candidate, RecruitmentStatus, Task } from '../types';
import { TaskTable } from './TaskTable';
import { generateRelatedTasks } from '../services/geminiService';

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'CAN-101',
    name: 'Jane Doe',
    role: 'Senior React Engineer',
    email: 'jane.d@example.com',
    status: RecruitmentStatus.INTERVIEW,
    interviewNotes: 'Strong knowledge of Hooks. Weak on CSS Grid.',
    relatedTasks: [
      { id: 't1', title: 'Schedule Technical Round 2', owner: 'Hiring Mgr', status: 'Pending', dueDate: '2023-11-01' }
    ]
  },
  {
    id: 'CAN-102',
    name: 'John Smith',
    role: 'Product Manager',
    email: 'john.s@example.com',
    status: RecruitmentStatus.APPLIED,
    interviewNotes: '',
    relatedTasks: []
  }
];

export const RecruitmentProcess: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  // A simplified edit view just inline or separate, reusing concepts from DefectProcess
  // For variety, let's use a split view layout for this one
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Candidate>>({});
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);

  const handleSelect = (c: Candidate) => {
    setSelectedCandidate(c);
    setFormData(c);
    setIsEditing(false);
  };

  const handleNew = () => {
    const newCand: Partial<Candidate> = {
        id: `CAN-${Math.floor(Math.random()*1000)}`,
        status: RecruitmentStatus.APPLIED,
        relatedTasks: []
    };
    setSelectedCandidate(null);
    setFormData(newCand);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedCandidate) {
        setCandidates(candidates.map(c => c.id === selectedCandidate.id ? { ...c, ...formData } as Candidate : c));
    } else {
        setCandidates([{ ...formData } as Candidate, ...candidates]);
    }
    setIsEditing(false);
    setSelectedCandidate(formData as Candidate);
  };

  const handleGenerateTasks = async () => {
      const context = `Candidate: ${formData.name}, Role: ${formData.role}, Status: ${formData.status}`;
      setIsGeneratingTasks(true);
      const rawTasks = await generateRelatedTasks(context, 'RECRUITMENT');
      const tasks: Task[] = rawTasks.map((t: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        title: t.title,
        owner: t.owner || 'Recruiter',
        status: 'Pending',
        dueDate: new Date(Date.now() + (t.dueDateOffset || 2) * 86400000).toISOString().split('T')[0]
      }));
      setFormData(prev => ({ ...prev, relatedTasks: [...(prev.relatedTasks || []), ...tasks] }));
      setIsGeneratingTasks(false);
  };

  return (
    <div className="flex-1 bg-slate-50 h-full overflow-hidden flex flex-col">
       <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Recruitment Pipeline</h1>
          <p className="text-slate-500 text-sm mt-1">Assignment #2: Manage talent acquisition</p>
        </div>
        <button onClick={handleNew} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center">
            <Plus className="w-5 h-5 mr-2" /> New Candidate
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar List */}
        <div className="w-1/3 border-r border-slate-200 bg-white overflow-y-auto">
            {candidates.map(c => (
                <div 
                    key={c.id} 
                    onClick={() => handleSelect(c)}
                    className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedCandidate?.id === c.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-slate-800">{c.name}</h3>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{c.status}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500 mb-1">
                        <Briefcase className="w-3 h-3 mr-1" /> {c.role}
                    </div>
                    <div className="flex items-center text-sm text-slate-400">
                        <Mail className="w-3 h-3 mr-1" /> {c.email}
                    </div>
                </div>
            ))}
        </div>

        {/* Detail View */}
        <div className="w-2/3 overflow-y-auto p-8 bg-slate-50">
            {(selectedCandidate || isEditing) ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800">
                            {isEditing ? 'Candidate Details' : selectedCandidate?.name}
                        </h2>
                        {!isEditing ? (
                            <button onClick={() => { setIsEditing(true); setFormData(selectedCandidate!); }} className="text-indigo-600 text-sm font-medium hover:underline">Edit</button>
                        ) : (
                            <div className="space-x-2">
                                <button onClick={() => setIsEditing(false)} className="text-slate-500 text-sm hover:text-slate-700">Cancel</button>
                                <button onClick={handleSave} className="bg-indigo-600 text-white text-sm px-3 py-1 rounded hover:bg-indigo-700">Save</button>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Fields */}
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Full Name</label>
                                {isEditing ? (
                                    <input className="w-full border-slate-300 rounded-md text-sm" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                                ) : (
                                    <p className="text-slate-800 font-medium">{selectedCandidate?.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Role Applying For</label>
                                {isEditing ? (
                                    <input className="w-full border-slate-300 rounded-md text-sm" value={formData.role || ''} onChange={e => setFormData({...formData, role: e.target.value})} />
                                ) : (
                                    <p className="text-slate-800 font-medium">{selectedCandidate?.role}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email</label>
                                {isEditing ? (
                                    <input className="w-full border-slate-300 rounded-md text-sm" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                                ) : (
                                    <p className="text-slate-800 font-medium">{selectedCandidate?.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Status</label>
                                {isEditing ? (
                                    <select className="w-full border-slate-300 rounded-md text-sm" value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value as RecruitmentStatus})}>
                                        {Object.values(RecruitmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                ) : (
                                    <p className="text-slate-800 font-medium">{selectedCandidate?.status}</p>
                                )}
                            </div>
                        </div>

                        {/* Large Text */}
                        <div>
                             <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Interview Notes</label>
                             {isEditing ? (
                                <textarea className="w-full border-slate-300 rounded-md text-sm" rows={4} value={formData.interviewNotes || ''} onChange={e => setFormData({...formData, interviewNotes: e.target.value})} />
                             ) : (
                                <p className="text-slate-600 text-sm whitespace-pre-wrap">{selectedCandidate?.interviewNotes || 'No notes added.'}</p>
                             )}
                        </div>

                        {/* Tasks */}
                        <div className="pt-6 border-t border-slate-100">
                             <TaskTable 
                                tasks={isEditing ? (formData.relatedTasks || []) : (selectedCandidate?.relatedTasks || [])}
                                onChange={tasks => isEditing ? setFormData({...formData, relatedTasks: tasks}) : null} 
                                onGenerateAI={isEditing ? handleGenerateTasks : undefined}
                                isGenerating={isGeneratingTasks}
                             />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Select a candidate to view details</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};