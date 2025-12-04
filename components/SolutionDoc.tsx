import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, RefreshCw, X } from 'lucide-react';
import { generateSolutionDescription } from '../services/geminiService';

interface SolutionDocProps {
  onClose: () => void;
}

export const SolutionDoc: React.FC<SolutionDocProps> = ({ onClose }) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    const details = `
      Recruitment Process Fields: Candidate Name, Role, Email, Status (Applied, Screening, Interview, Offer, Hired), Interview Notes. 
      Related Tasks: Auto-generated tasks for hiring steps.
      Defect Process Fields: Date, Customer, Description, Category (AI Classified), Feature Link, Status.
      User Journeys: 
      1. Recruiter creates candidate -> AI suggests interview tasks -> Recruiter tracks status.
      2. Support logs defect -> AI classifies it -> Dev works on tasks.
    `;
    
    const text = await generateSolutionDescription('Recruitment & Defect Management', details);
    setContent(text);
    setIsLoading(false);
    setHasGenerated(true);
  };

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col">
       <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center">
             <FileText className="w-6 h-6 mr-3 text-indigo-600" />
             Solution Documentation (Assignment #2)
           </h1>
           <p className="text-slate-500 text-sm mt-1">AI-generated analysis and solution description</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
            <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex">
          {/* Controls */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 p-6 flex flex-col">
             <div className="mb-6">
                <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Controls</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Click generate to have the AI write the detailed solution document required for Assignment #2 based on the current app structure.
                </p>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all"
                >
                    {isLoading ? (
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                        <RefreshCw className="w-5 h-5 mr-2" />
                    )}
                    {hasGenerated ? 'Regenerate Doc' : 'Generate Doc'}
                </button>
             </div>
             
             <div className="mt-auto">
                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                    <h4 className="text-blue-800 font-bold text-xs uppercase mb-1">Evaluation Criteria</h4>
                    <ul className="text-xs text-blue-700 list-disc pl-4 space-y-1">
                        <li>Analytical thinking</li>
                        <li>Communication</li>
                        <li>Presentation</li>
                        <li>Creativity</li>
                    </ul>
                 </div>
             </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-12 bg-white">
              {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                      <p>Analyzing app structure and generating solution document...</p>
                  </div>
              ) : content ? (
                  <div className="prose prose-slate max-w-3xl mx-auto">
                      <ReactMarkdown 
                        components={{
                            h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-slate-900 mb-6" {...props} />,
                            h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4 pb-2 border-b border-slate-100" {...props} />,
                            h3: ({node, ...props}) => <h3 className="text-xl font-bold text-slate-800 mt-6 mb-3" {...props} />,
                            p: ({node, ...props}) => <p className="text-slate-600 leading-relaxed mb-4" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-5 text-slate-600 mb-4 space-y-2" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                        }}
                      >
                          {content}
                      </ReactMarkdown>
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300">
                      <FileText className="w-24 h-24 mb-4 opacity-20" />
                      <p className="text-lg font-medium">Ready to generate solution description</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};