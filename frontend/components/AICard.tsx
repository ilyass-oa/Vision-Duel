import React from 'react';
import { AIModel, Prediction } from '../types';

interface AICardProps {
  model: AIModel;
  prediction?: Prediction;
  loading?: boolean;
  highlightStability?: boolean; // For stress test
  showUncertainty?: boolean;
}

export const AICard: React.FC<AICardProps> = ({ 
  model, 
  prediction, 
  loading = false,
  highlightStability = false,
  showUncertainty = false
}) => {
  // Determine color based on prediction state
  const isUncertain = prediction?.label === 'INCERTAIN';
  
  // Retro style colors
  let statusColor = "bg-gray-100 border-black text-gray-500";
  
  if (prediction && !loading) {
     if (isUncertain) {
       statusColor = "bg-yellow-100 border-black text-yellow-800";
     } else if (prediction.label === 'CHAT') {
       statusColor = "bg-green-100 border-black text-green-800";
     } else {
       statusColor = "bg-red-100 border-black text-red-800";
     }
  }

  // Calculate bar width
  const confidence = prediction?.confidence || 0;
  
  // Logic for stability visualization
  const isStable = prediction?.isStable ?? true;
  const containerBorder = highlightStability 
    ? (isStable ? "border-green-600 ring-2 ring-green-100" : "border-red-600 ring-4 ring-red-100") 
    : "border-black";

  // Override containerBorder for the base retro style always having black border
  // We can use background tint for stability instead to keep the retro border consistent
  const cardBg = highlightStability && !isStable ? "bg-red-50" : (highlightStability && isStable ? "bg-green-50" : "bg-white");

  return (
    <div className={`${cardBg} rounded-lg p-6 transition-all duration-300 border-2 border-black shadow-retro h-full flex flex-col relative group hover:-translate-y-1 hover:shadow-retro-lg`}>
      {/* Label Badge */}
      <div className={`absolute -top-3 left-6 px-3 py-1 text-xs font-mono font-bold uppercase border border-black ${model.id === 'A' ? 'bg-brand-blue text-white' : 'bg-brand-orange text-white'}`}>
        Modèle {model.id}
      </div>

      <div className="flex items-center gap-4 mt-2 mb-6 border-b-2 border-dashed border-gray-200 pb-4">
        <div className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-2xl ${model.color} text-white shadow-retro-sm`}>
          {model.avatar}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 leading-tight text-lg font-mono uppercase">{model.name}</h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{model.type}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-3">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-brand-black rounded-full animate-spin border-t-black"></div>
            <p className="text-sm font-mono text-gray-500 uppercase">Analyse en cours...</p>
          </div>
        ) : prediction ? (
          <div className="space-y-4">
            <div className={`py-3 px-4 rounded border-2 font-bold text-lg tracking-wide text-center uppercase ${statusColor}`}>
              {prediction.label}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold font-mono text-gray-600 uppercase">
                <span>Indice de Confiance</span>
                <span>{confidence}%</span>
              </div>
              <div className="w-full h-4 bg-gray-100 border border-black rounded-full overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out border border-black/10 ${model.id === 'A' ? 'bg-brand-blue' : 'bg-brand-orange'}`}
                  style={{ width: `${confidence}%` }}
                ></div>
              </div>
            </div>

            {highlightStability && !isStable && (
               <div className="mt-2 text-center bg-red-100 border border-red-500 text-red-600 p-2 rounded font-mono text-xs font-bold animate-pulse">
                 ⚠ DÉTECTION D'INSTABILITÉ
               </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm font-mono uppercase border-2 border-dashed border-gray-200 rounded-lg">
            En attente de données
          </div>
        )}
      </div>
    </div>
  );
};