import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { DefectProcess } from './components/DefectProcess';
import { RecruitmentProcess } from './components/RecruitmentProcess';
import { SolutionDoc } from './components/SolutionDoc';
import { ProcessType } from './types';

function App() {
  const [currentProcess, setCurrentProcess] = useState<ProcessType>(ProcessType.DEFECT);
  const [showDoc, setShowDoc] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentProcess={currentProcess} 
        onProcessChange={(p) => { setCurrentProcess(p); setShowDoc(false); }}
        onViewDoc={() => setShowDoc(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {showDoc ? (
            <SolutionDoc onClose={() => setShowDoc(false)} />
        ) : (
            <>
                {currentProcess === ProcessType.DEFECT && <DefectProcess />}
                {currentProcess === ProcessType.RECRUITMENT && <RecruitmentProcess />}
            </>
        )}
      </main>
    </div>
  );
}

export default App;