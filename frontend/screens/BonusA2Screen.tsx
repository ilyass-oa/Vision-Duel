import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { ArrowRight } from 'lucide-react';
import { TRAINING_METRICS } from '../constants';

export const BonusA2Screen: React.FC<{ onNext: () => void }> = ({ onNext }) => {
    const [visibleEpochs, setVisibleEpochs] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleEpochs(prev => {
                if (prev >= 10) { clearInterval(interval); return 10; }
                return prev + 1;
            });
        }, 400);
        return () => clearInterval(interval);
    }, []);

    const loss = TRAINING_METRICS.modelB_loss;
    const acc = TRAINING_METRICS.modelB_train_acc;
    const maxLoss = Math.max(...loss);

    const W = 400, H = 180, PAD = 30;
    const chartW = W - 2 * PAD, chartH = H - 2 * PAD;

    const lossPoints = loss.slice(0, visibleEpochs).map((v, i) => {
        const x = PAD + (i / 9) * chartW;
        const y = PAD + (1 - v / maxLoss) * chartH;
        return `${x},${y}`;
    }).join(' ');

    const accPoints = acc.slice(0, visibleEpochs).map((v, i) => {
        const x = PAD + (i / 9) * chartW;
        const y = PAD + (1 - v / 100) * chartH;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
            <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
            <div className="max-w-3xl w-full bg-white rounded-lg border-2 md:border-4 border-black shadow-retro-lg p-6 md:p-10 space-y-4 md:space-y-8 animate-fade-in z-10">
                <div className="text-center">
                    <span className="bg-indigo-100 text-indigo-700 px-3 md:px-4 py-1 rounded-full border border-indigo-300 font-mono text-xs font-bold uppercase">Bonus A - Écran 2/3</span>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-3 md:mt-4">Pendant l'apprentissage</h2>
                </div>

                <div className="bg-gray-50 border-2 border-black rounded-lg p-6">
                    <div className="flex gap-4 mb-4 justify-center">
                        <span className="flex items-center gap-2 text-xs font-mono"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Erreur (loss)</span>
                        <span className="flex items-center gap-2 text-xs font-mono"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Réussite (%)</span>
                    </div>
                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 250 }}>
                        {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                            <line key={frac} x1={PAD} y1={PAD + frac * chartH} x2={W - PAD} y2={PAD + frac * chartH} stroke="#e5e7eb" strokeWidth="1" />
                        ))}
                        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#000" strokeWidth="2" />
                        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#000" strokeWidth="2" />
                        <text x={W / 2} y={H - 5} textAnchor="middle" className="text-[10px]" fill="#666" fontFamily="monospace">Epochs</text>
                        {visibleEpochs > 1 && (
                            <polyline points={lossPoints} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        )}
                        {visibleEpochs > 1 && (
                            <polyline points={accPoints} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        )}
                        {loss.slice(0, visibleEpochs).map((v, i) => {
                            const x = PAD + (i / 9) * chartW;
                            const y = PAD + (1 - v / maxLoss) * chartH;
                            return <circle key={`l${i}`} cx={x} cy={y} r="4" fill="#ef4444" stroke="#000" strokeWidth="1" />;
                        })}
                        {acc.slice(0, visibleEpochs).map((v, i) => {
                            const x = PAD + (i / 9) * chartW;
                            const y = PAD + (1 - v / 100) * chartH;
                            return <circle key={`a${i}`} cx={x} cy={y} r="4" fill="#22c55e" stroke="#000" strokeWidth="1" />;
                        })}
                    </svg>
                    {visibleEpochs > 0 && (
                        <div className="flex justify-between mt-4 px-4">
                            <div className="text-center">
                                <div className="text-red-600 font-black text-lg">{loss[Math.min(visibleEpochs - 1, 9)].toFixed(4)}</div>
                                <div className="text-xs text-gray-500 font-mono">Erreur actuelle</div>
                            </div>
                            <div className="text-center">
                                <div className="text-green-600 font-black text-lg">{acc[Math.min(visibleEpochs - 1, 9)].toFixed(1)}%</div>
                                <div className="text-xs text-gray-500 font-mono">Réussite actuelle</div>
                            </div>
                            <div className="text-center">
                                <div className="text-gray-800 font-black text-lg">{visibleEpochs}/10</div>
                                <div className="text-xs text-gray-500 font-mono">Epoch</div>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-center italic text-gray-500 font-mono text-sm">
                    "Il apprend en ajustant des nombres internes pour réduire son erreur, un peu comme une calibration."
                </p>

                <div className="flex justify-center">
                    <Button onClick={onNext}>
                        Suivant <ArrowRight className="inline ml-2" size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};
