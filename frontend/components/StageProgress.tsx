import React from 'react';

interface StageProgressProps {
  currentStage: number;
  totalStages: number;
  title: string;
  subtitle?: string;
}

export const StageProgress: React.FC<StageProgressProps> = ({ currentStage, totalStages, title, subtitle }) => {
  return (
    <div className="w-full bg-white border-b-4 border-black sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded border border-black/10">
             {[...Array(totalStages)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-3 w-3 rounded-full border border-black transition-colors duration-300 ${i + 1 <= currentStage ? 'bg-brand-dark' : 'bg-white'}`}
                />
             ))}
          </div>
          <div>
            <h2 className="text-base md:text-xl font-black uppercase tracking-tight text-gray-900 leading-none">{title}</h2>
            {subtitle && <p className="text-[10px] md:text-xs text-gray-500 mt-1 font-mono">{subtitle}</p>}
          </div>
        </div>
        <div className="px-2 md:px-3 py-1 bg-green-100 text-green-800 border border-green-300 rounded font-mono text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1 md:gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="hidden sm:inline">Mode Inspecteur</span>
          <span className="sm:hidden">Inspecteur</span>
        </div>
      </div>
    </div>
  );
};