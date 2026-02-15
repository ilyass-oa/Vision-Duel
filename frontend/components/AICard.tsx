import React from 'react';
import { AIModel, Prediction } from '../types';

interface AICardProps {
  model: AIModel;
  prediction?: Prediction;
  loading?: boolean;
  highlightStability?: boolean;
  showUncertainty?: boolean;
}

export const AICard: React.FC<AICardProps> = ({ model, prediction, loading, highlightStability, showUncertainty }) => {
  const isA = model.id === 'A';
  const borderColor = isA ? 'border-brand-blue' : 'border-brand-orange';
  const bgColor = isA ? 'bg-blue-50' : 'bg-orange-50';
  const accentColor = isA ? 'brand-blue' : 'brand-orange';

  const confidenceColor = (conf: number) => {
    if (conf >= 90) return 'text-green-600';
    if (conf >= 70) return 'text-yellow-600';
    return 'text-red-500';
  };

  const stabilityDisplay = (s?: string) => {
    if (!s) return null;
    const cfg: Record<string, { bg: string; text: string; label: string }> = {
      STABLE: { bg: 'bg-green-100 border-green-500', text: 'text-green-700', label: 'STABLE' },
      FRAGILE: { bg: 'bg-yellow-100 border-yellow-500', text: 'text-yellow-700', label: 'FRAGILE' },
      CASSE: { bg: 'bg-red-100 border-red-500', text: 'text-red-700', label: 'CASSE' },
    };
    const c = cfg[s] || cfg.STABLE;
    return (
      <div className={`${c.bg} ${c.text} border px-3 py-1 rounded-full font-mono text-xs font-black uppercase tracking-wider text-center ${s !== 'STABLE' ? 'animate-pulse' : ''}`}>
        {c.label}
      </div>
    );
  };

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-5 h-full flex flex-col shadow-retro-sm relative`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <div className={`w-12 h-12 rounded-full bg-${accentColor} border-2 border-black flex items-center justify-center text-xl font-black text-white shadow-sm`}>
          {model.avatar}
        </div>
        <div>
          <h3 className="font-black text-lg leading-none uppercase tracking-tight">{model.name}</h3>
          <span className="text-xs text-gray-500 font-mono uppercase">{model.type}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
            <span className="text-xs text-gray-500 font-mono uppercase tracking-wider">Analyse...</span>
          </div>
        ) : prediction ? (
          <div className="space-y-4 animate-fade-in">
            {/* Label */}
            <div className="text-center">
              <div className={`inline-block px-6 py-2 rounded-lg border-2 border-black font-black text-xl uppercase tracking-wider shadow-sm ${prediction.label === 'CHAT' ? 'bg-green-200 text-green-900' :
                  prediction.label === 'INCERTAIN' ? 'bg-yellow-200 text-yellow-900 animate-pulse' :
                    'bg-red-200 text-red-900'
                }`}>
                {prediction.label}
              </div>
            </div>

            {/* Confidence bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-500 font-mono uppercase">Confiance</span>
                <span className={`font-mono text-sm font-black ${confidenceColor(prediction.confidence)}`}>
                  {prediction.confidence}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full border border-black overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${prediction.confidence >= 90 ? 'bg-green-500' :
                      prediction.confidence >= 70 ? 'bg-yellow-400' :
                        'bg-red-400'
                    }`}
                  style={{ width: `${prediction.confidence}%` }}
                />
              </div>
            </div>

            {/* Stability indicator */}
            {highlightStability && prediction.stability && (
              <div className="mt-2">{stabilityDisplay(prediction.stability)}</div>
            )}

            {/* Uncertainty indicator */}
            {showUncertainty && prediction.label === 'INCERTAIN' && (
              <div className="bg-yellow-50 border border-yellow-400 rounded p-2 text-center">
                <span className="text-xs font-mono text-yellow-700 font-bold uppercase">Cette IA s'abstient</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <span className="text-gray-400 font-mono text-sm uppercase tracking-wider">En attente</span>
          </div>
        )}
      </div>
    </div>
  );
};