import React from 'react';
import { Layout, Bug, Users, Settings, FileText, Activity } from 'lucide-react';
import { ProcessType } from '../types';

interface SidebarProps {
  currentProcess: ProcessType;
  onProcessChange: (p: ProcessType) => void;
  onViewDoc: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentProcess, onProcessChange, onViewDoc }) => {
  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800 flex-shrink-0">
      <div className="p-6 flex items-center space-x-2 text-white font-bold text-xl tracking-tight">
        <Layout className="w-8 h-8 text-indigo-500" />
        <span>UniFlow</span>
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
          Assignments
        </div>

        <button
          onClick={() => onProcessChange(ProcessType.DEFECT)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            currentProcess === ProcessType.DEFECT
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Bug className="w-5 h-5" />
          <span>Defects</span>
        </button>

        <button
          onClick={() => onProcessChange(ProcessType.RECRUITMENT)}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            currentProcess === ProcessType.RECRUITMENT
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Recruitment</span>
        </button>

        <div className="pt-6 mt-6 border-t border-slate-800">
           <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
             Resources
           </div>
           <button
            onClick={onViewDoc}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-slate-800 hover:text-white"
          >
            <FileText className="w-5 h-5" />
            <span>Solution Doc (AI)</span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 text-sm text-slate-500">
          <Settings className="w-4 h-4" />
          <span>Org Settings</span>
        </div>
      </div>
    </div>
  );
};