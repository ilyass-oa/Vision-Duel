import React, { useState } from 'react';
import { StageProgress } from '../components/StageProgress';
import { AICard } from '../components/AICard';
import { Button } from '../components/Button';
import { BookOpen, Sparkles, Eye, ArrowRight } from 'lucide-react';
import { MODEL_A, MODEL_B } from '../constants';
import { useAppContext } from '../context/AppContext';

export const BriefingScreen: React.FC = () => {
    const { switchTest, trainingSamplesA, trainingSamplesB } = useAppContext();
    const [showTrainingA, setShowTrainingA] = useState(false);
    const [showTrainingB, setShowTrainingB] = useState(false);

    return (
        <div className="min-h-screen flex flex-col">
            <StageProgress currentStage={0} totalStages={3} title="Briefing" />

            {/* Briefing + Objectif */}
            <div className="bg-white border-b-4 border-black p-3 md:p-5">
                <div className="max-w-3xl mx-auto space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-brand-dark border-2 border-black flex items-center justify-center flex-shrink-0 rounded">
                            <BookOpen size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase text-gray-800 mb-1">Briefing</p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                Teste <strong>deux IA</strong> qui reconnaissent les chats. Entraînées différemment, elles réagissent différemment.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-300 border-2 border-black flex items-center justify-center flex-shrink-0 rounded">
                            <Sparkles size={16} className="text-black" />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase text-gray-800 mb-1">Objectif</p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                À la fin, tu décides <strong>laquelle est la plus fiable</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Candidats A vs B */}
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 p-4 md:p-8 max-w-6xl mx-auto w-full">

                {/* IA A Card */}
                <div className="flex-1 w-full md:w-auto bg-white p-4 md:p-8 rounded-lg shadow-retro border-2 border-black flex flex-col items-center text-center space-y-3 md:space-y-4 animate-slide-up relative" style={{ animationDelay: '0.1s' }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-blue border-2 border-black px-3 md:px-4 py-1 text-white font-mono font-bold uppercase text-xs md:text-sm">Candidat A</div>
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${MODEL_A.color} border-2 border-black flex items-center justify-center text-3xl md:text-4xl font-black text-white mb-2 md:mb-4 shadow-retro-sm`}>{MODEL_A.avatar}</div>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{MODEL_A.name}</h2>
                    <div className="group relative">
                        <div className="px-3 py-1 bg-blue-100 text-blue-900 border border-black rounded font-mono text-xs font-bold uppercase cursor-help">{MODEL_A.type}</div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-xs font-mono px-3 py-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            Très bon sur images standard
                        </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed font-medium text-sm">Performante sur images nettes et standard.</p>
                    <button onClick={() => setShowTrainingA(!showTrainingA)} className="text-xs font-mono text-blue-500 hover:text-blue-800 underline flex items-center gap-1 transition-colors">
                        <Eye size={12} /> {showTrainingA ? 'Masquer' : 'Voir entraînement'}
                    </button>
                    {showTrainingA && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full animate-fade-in">
                            <div className="grid grid-cols-4 gap-1.5 mb-2">
                                {trainingSamplesA.map((s, i) => (
                                    <div key={i} className="relative">
                                        <img src={s.url} alt="Training" className="w-full h-14 object-contain rounded border border-blue-300" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-1 rounded">Images nettes, bien cadrées</p>
                            <p className="text-[9px] text-gray-500 mt-1 italic">Ça influence la fiabilité.</p>
                        </div>
                    )}
                </div>

                {/* VS Divider */}
                <div className="flex flex-col items-center gap-2">
                    <div className="text-gray-300 font-black text-4xl italic">VS</div>
                    <p className="text-xs font-mono text-gray-400 text-center max-w-[120px]">Même tâche.<br />Entraînement différent.</p>
                </div>

                {/* IA B Card */}
                <div className="flex-1 w-full md:w-auto bg-white p-4 md:p-8 rounded-lg shadow-retro border-2 border-black flex flex-col items-center text-center space-y-3 md:space-y-4 animate-slide-up relative" style={{ animationDelay: '0.2s' }}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-orange border-2 border-black px-3 md:px-4 py-1 text-white font-mono font-bold uppercase text-xs md:text-sm">Candidat B</div>
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${MODEL_B.color} border-2 border-black flex items-center justify-center text-3xl md:text-4xl font-black text-white mb-2 md:mb-4 shadow-retro-sm`}>{MODEL_B.avatar}</div>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{MODEL_B.name}</h2>
                    <div className="group relative">
                        <div className="px-3 py-1 bg-orange-100 text-orange-900 border border-black rounded font-mono text-xs font-bold uppercase cursor-help">{MODEL_B.type}</div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-xs font-mono px-3 py-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            Tient mieux quand ça change
                        </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed font-medium text-sm">Résiste aux variations, admet le doute.</p>
                    <button onClick={() => setShowTrainingB(!showTrainingB)} className="text-xs font-mono text-orange-500 hover:text-orange-800 underline flex items-center gap-1 transition-colors">
                        <Eye size={12} /> {showTrainingB ? 'Masquer' : 'Voir entraînement'}
                    </button>
                    {showTrainingB && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 w-full animate-fade-in">
                            <div className="grid grid-cols-4 gap-1.5 mb-2">
                                {trainingSamplesB.map((s, i) => (
                                    <div key={i} className="relative">
                                        <img src={s.url} alt="Training" className="w-full h-14 object-contain rounded border border-orange-300" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] font-mono text-orange-700 bg-orange-100 px-2 py-1 rounded">Variations (lumière, recadrage) + cas difficiles</p>
                            <p className="text-[9px] text-gray-500 mt-1 italic">Ça influence la fiabilité.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 md:p-8 flex flex-col sm:flex-row justify-center items-center gap-3 bg-white border-t-4 border-black">
                <Button
                    variant="secondary"
                    onClick={() => switchTest('WELCOME')}
                    className="w-full sm:w-auto text-base md:text-lg"
                >
                    Retour au menu principal
                </Button>
                <Button onClick={() => switchTest('TEST_1_DUEL')} className="w-full max-w-md text-base md:text-lg">
                    Je commence les tests <ArrowRight className="inline ml-2" size={20} />
                </Button>
            </div>
        </div>
    );
};
