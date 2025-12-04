import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertCircle, CheckCircle, Paperclip, X } from 'lucide-react';
import { Defect, DefectStatus, DefectCategory, Task } from '../types';
import { TaskTable } from './TaskTable';
import { suggestDefectCategory, generateRelatedTasks } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Mock Data
const INITIAL_DEFECTS: Defect[] = [
  {
    id: 'DEF-001',
    dateReported: '2023-10-25',
    customerName: 'Acme Corp',
    description: 'Login button fails when password contains special characters.',
    category: DefectCategory.FUNCTIONAL,
    status: DefectStatus.IN_PROGRESS,
    featureLink: 'Auth Module',
    attachments: [],
    relatedTasks: [
      { id: '1', title: 'Check regex validation', owner: 'DevTeam', status: 'In Progress', dueDate: '2023-10-27' }
    ]
  },
  {
    id: 'DEF-002',
    dateReported: '2023-10-26',
    customerName: 'Globex Inc',
    description: 'Invoice total calculation is off by 1 cent due to rounding.',
    category: DefectCategory.LOGICAL,
    status: DefectStatus.NEW,
    featureLink: 'Billing',
    attachments: [],
    relatedTasks: []
  }
];

export const DefectProcess: React.FC = () => {
  const [defects, setDefects] = useState<Defect[]>(INITIAL_DEFECTS);
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Edit Form State
  const [formData, setFormData] = useState<Partial<Defect>>({});
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [isAIGeneratingTasks, setIsAIGeneratingTasks] = useState(false);

  // Stats
  const stats = [
    { name: 'New', value: defects.filter(d => d.status === DefectStatus.NEW).length, color: '#f59e0b' },
    { name: 'In Progress', value: defects.filter(d => d.status === DefectStatus.IN_PROGRESS).length, color: '#3b82f6' },
    { name: 'Resolved', value: defects.filter(d => d.status === DefectStatus.RESOLVED).length, color: '#10b981' },
  ];

  const handleOpenModal = (defect?: Defect) => {
    if (defect) {
      setFormData({ ...defect });
      setSelectedDefect(defect);
    } else {
      setFormData({
        id: `DEF-${String(defects.length + 1).padStart(3, '0')}`,
        dateReported: new Date().toISOString().split('T')[0],
        status: DefectStatus.NEW,
        relatedTasks: [],
        attachments: []
      });
      setSelectedDefect(null);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (selectedDefect) {
      setDefects(defects.map(d => d.id === selectedDefect.id ? { ...d, ...formData } as Defect : d));
    } else {
      setDefects([formData as Defect, ...defects]);
    }
    setIsModalOpen(false);
  };

  const handleSuggestCategory = async () => {
    if (!formData.description) return;
    setIsAISuggesting(true);
    const category = await suggestDefectCategory(formData.description);
    setFormData(prev => ({ ...prev, category }));
    setIsAISuggesting(false);
  };

  const handleGenerateTasks = async () => {
    if (!formData.description) return;
    setIsAIGeneratingTasks(true);
    const rawTasks = await generateRelatedTasks(formData.description, 'DEFECT');
    const tasks: Task[] = rawTasks.map((t: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      title: t.title,
      owner: t.owner || 'Unassigned',
      status: 'Pending',
      dueDate: new Date(Date.now() + (t.dueDateOffset || 2) * 86400000).toISOString().split('T')[0]
    }));
    setFormData(prev => ({ ...prev, relatedTasks: [...(prev.relatedTasks || []), ...tasks] }));
    setIsAIGeneratingTasks(false);
  };

  return (
    <div className="flex-1 bg-slate-50 h-full overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Defect Management</h1>
          <p className="text-slate-500 text-sm mt-1">Assignment #1: Track and resolve customer issues</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-all shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Report Defect
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main List */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <h3 className="text-slate-500 font-medium text-sm">Total Defects</h3>
              <p className="text-3xl font-bold text-slate-800 mt-2">{defects.length}</p>
            </div>
             {/* Simple Chart */}
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:col-span-3 flex items-center">
                <div className="w-full h-24 flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats} dataKey="value" innerRadius={30} outerRadius={40} paddingAngle={5}>
                          {stats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex space-x-6 ml-6">
                        {stats.map(s => (
                            <div key={s.name} className="flex items-center">
                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: s.color }}></span>
                                <span className="text-sm text-slate-600 font-medium">{s.name}: {s.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {defects.map(defect => (
                    <tr 
                        key={defect.id} 
                        onClick={() => handleOpenModal(defect)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{defect.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${defect.status === DefectStatus.NEW ? 'bg-amber-100 text-amber-800' : 
                            defect.status === DefectStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-800' : 
                            'bg-emerald-100 text-emerald-800'}`}>
                          {defect.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{defect.description}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{defect.customerName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{defect.category}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{defect.dateReported}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* Modal / Slide-over */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl transform transition-transform flex flex-col h-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">
                {selectedDefect ? `Edit Defect ${selectedDefect.id}` : 'New Defect'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date Reported</label>
                  <input
                    type="date"
                    className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.dateReported || ''}
                    onChange={e => setFormData({ ...formData, dateReported: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                  <input
                    type="text"
                    placeholder="Search or add customer..."
                    className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.customerName || ''}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  />
                </div>
              </div>

              {/* Description & Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Describe the defect in detail..."
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-slate-700">Category</label>
                        <button 
                            type="button"
                            onClick={handleSuggestCategory}
                            disabled={isAISuggesting || !formData.description}
                            className="text-xs text-indigo-600 font-medium hover:text-indigo-800 disabled:opacity-50 flex items-center"
                        >
                            {isAISuggesting ? 'Analyzing...' : '✨ Auto-Categorize'}
                        </button>
                    </div>
                    <select
                        className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.category || DefectCategory.OTHER}
                        onChange={e => setFormData({ ...formData, category: e.target.value as DefectCategory })}
                    >
                        {Object.values(DefectCategory).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                        className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.status || DefectStatus.NEW}
                        onChange={e => setFormData({ ...formData, status: e.target.value as DefectStatus })}
                    >
                        {Object.values(DefectStatus).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                 </div>
              </div>

              {/* Feature Link & File Upload */}
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Feature Link</label>
                    <input
                        type="text"
                        placeholder="e.g. Login Module"
                        className="w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.featureLink || ''}
                        onChange={e => setFormData({ ...formData, featureLink: e.target.value })}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Attachments</label>
                    <div className="flex items-center space-x-2">
                        <label className="flex-1 flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer">
                            <Paperclip className="w-4 h-4 mr-2" />
                            <span>Upload File</span>
                            <input type="file" className="hidden" />
                        </label>
                    </div>
                 </div>
              </div>

              {/* Tasks */}
              <div className="pt-4 border-t border-slate-100">
                <TaskTable 
                    tasks={formData.relatedTasks || []}
                    onChange={(tasks) => setFormData({...formData, relatedTasks: tasks})}
                    onGenerateAI={handleGenerateTasks}
                    isGenerating={isAIGeneratingTasks}
                />
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};