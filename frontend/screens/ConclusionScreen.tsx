import React from 'react';
import { Eye, ShieldCheck, Brain, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const ConclusionScreen: React.FC = () => {
    const { test1Scores, test2Scores, test3Scores, switchTest, setCompletedTests, setTest1Scores, setTest2Scores, setTest3Scores } = useAppContext();

    const pct = (n: number, t: number) => t > 0 ? Math.round((n / t) * 100) : 0;

    const scoreA_T1 = pct(test1Scores.modelACorrect, test1Scores.modelATotal);
    const scoreB_T1 = pct(test1Scores.modelBCorrect, test1Scores.modelBTotal);
    const scoreA_T2 = pct(test2Scores.modelACorrect, test2Scores.modelATotal);
    const scoreB_T2 = pct(test2Scores.modelBCorrect, test2Scores.modelBTotal);
    const scoreA_T3 = pct(test3Scores.modelACorrect, test3Scores.modelATotal);
    const scoreB_T3 = pct(test3Scores.modelBCorrect, test3Scores.modelBTotal);

    const resetAll = () => {
        setCompletedTests(new Set());
        setTest1Scores({ humanCorrect: 0, humanTotal: 0, modelACorrect: 0, modelATotal: 0, modelBCorrect: 0, modelBTotal: 0 });
        setTest2Scores({ humanCorrect: 0, humanTotal: 0, modelACorrect: 0, modelATotal: 0, modelBCorrect: 0, modelBTotal: 0 });
        setTest3Scores({ humanCorrect: 0, humanTotal: 0, modelACorrect: 0, modelATotal: 0, modelBCorrect: 0, modelBTotal: 0 });
        switchTest('WELCOME');
    };

    return (
        <div className="min-h-screen flex flex-col relative">
            <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
            <div className="absolute top-10 left-10 opacity-10 pointer-events-none -rotate-12 z-0 hidden md:block"><Eye size={120} /></div>
            <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none rotate-12 z-0 hidden md:block"><ShieldCheck size={120} /></div>
            <div className="flex-1 flex flex-col items-center justify-center p-3 md:p-6 z-10">
                <div className="w-full max-w-[90rem] bg-white rounded-lg border-2 md:border-4 border-black shadow-retro-lg p-3 md:p-5 space-y-2 md:space-y-3">

                    {/* Header */}
                    <div className="text-center bg-brand-dark rounded-lg p-3 md:p-4 border-2 border-black">
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-1 text-white">🏁 Conclusion</h2>
                        <p className="font-mono text-gray-300 text-xs md:text-sm">Résumé de l'activité — Chat / Pas Chat</p>
                    </div>

                    {/* Stats résumé */}
                    <div className="bg-gray-50 border-2 border-black rounded-lg p-3 md:p-4 shadow-retro-sm">
                        <table className="w-full text-xs md:text-sm font-mono">
                            <thead>
                                <tr className="border-b-2 border-black bg-gray-100">
                                    <th className="text-left py-2 px-3 text-gray-500 uppercase text-xs rounded-tl">Test</th>
                                    <th className="text-center py-2 text-brand-blue uppercase text-xs">IA A</th>
                                    <th className="text-center py-2 text-brand-orange uppercase text-xs rounded-tr">IA B</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200 bg-blue-50/40">
                                    <td className="py-2 px-3">⚡ Rapidité</td>
                                    <td className="text-center font-bold text-brand-blue">{scoreA_T1}%</td>
                                    <td className="text-center font-bold text-brand-orange">{scoreB_T1}%</td>
                                </tr>
                                <tr className="border-b border-gray-200 bg-orange-50/40">
                                    <td className="py-2 px-3">🌫️ Flou</td>
                                    <td className="text-center font-bold text-brand-blue">{scoreA_T2}%</td>
                                    <td className="text-center font-bold text-brand-orange">{scoreB_T2}%</td>
                                </tr>
                                <tr className="bg-purple-50/40">
                                    <td className="py-2 px-3">❓ Faux Amis</td>
                                    <td className="text-center font-bold text-brand-blue">{scoreA_T3}%</td>
                                    <td className="text-center font-bold text-brand-orange">{scoreB_T3}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Conclusion text */}
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 shadow-retro-sm space-y-2">
                        <p className="text-sm text-gray-800 leading-snug">
                            Tu as testé <strong className="bg-yellow-200 px-1">"chat / pas chat"</strong> avec deux IA. Résultat : une IA n'a pas d'intelligence générale. Elle apprend sur des exemples et calcule des scores. Si les images ressemblent à l'entraînement, elle est performante. Sinon (flash, flou, faux amis), ses erreurs diffèrent de l'humain.
                        </p>
                        <p className="text-sm text-gray-800 leading-snug font-bold bg-brand-dark/10 p-3 rounded border-l-4 border-brand-dark">
                            La qualité dépend des données et conditions d'usage. Un bon modèle reste <strong>stable</strong> quand la qualité baisse et gère les cas ambigus.
                        </p>
                    </div>

                    {/* 3 Règles à emporter */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 shadow-retro-sm hover:shadow-retro hover:-translate-y-0.5 transition-all">
                            <div className="w-8 h-8 bg-brand-blue text-white border-2 border-black flex items-center justify-center font-black text-sm mb-3 rounded">1</div>
                            <h4 className="font-black text-sm uppercase mb-2 text-blue-900">Pas "intelligente en général"</h4>
                            <p className="text-xs text-blue-800 font-mono leading-snug">Bonne sur des situations proches de l'entraînement.</p>
                        </div>
                        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 shadow-retro-sm hover:shadow-retro hover:-translate-y-0.5 transition-all">
                            <div className="w-8 h-8 bg-brand-orange text-white border-2 border-black flex items-center justify-center font-black text-sm mb-3 rounded">2</div>
                            <h4 className="font-black text-sm uppercase mb-2 text-orange-900">La fiabilité se teste</h4>
                            <p className="text-xs text-orange-800 font-mono leading-snug">Teste quand l'info baisse (flash, flou, faux amis), pas que sur images faciles.</p>
                        </div>
                        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 shadow-retro-sm hover:shadow-retro hover:-translate-y-0.5 transition-all">
                            <div className="w-8 h-8 bg-yellow-400 text-black border-2 border-black flex items-center justify-center font-black text-sm mb-3 rounded">3</div>
                            <h4 className="font-black text-sm uppercase mb-2 text-yellow-900">Confiance ≠ vérité</h4>
                            <p className="text-xs text-yellow-800 font-mono leading-snug">L'IA peut être sûre et se tromper. Gère l'incertitude : vérifie, abstiens-toi, teste.</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 pt-2">
                        <button onClick={() => switchTest('BONUS_MENU')} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 md:py-3 md:px-8 border-2 border-black shadow-retro active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-xs md:text-sm flex items-center justify-center gap-2">
                            <Brain size={16} className="md:hidden" />
                            <Brain size={18} className="hidden md:block" />Petit plus pour les curieux
                        </button>
                        <button onClick={resetAll} className="bg-brand-dark hover:bg-gray-800 text-white font-bold py-2 px-4 md:py-3 md:px-8 border-2 border-black shadow-retro active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-xs md:text-sm flex items-center justify-center gap-2">
                            <RefreshCw size={16} className="md:hidden" />
                            <RefreshCw size={18} className="hidden md:block" />Recommencer
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};
