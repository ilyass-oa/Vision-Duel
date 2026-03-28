import React from 'react';
import { Button } from '../components/Button';
import { TopNav } from '../components/TopNav';
import { ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Result1Screen: React.FC = () => {
    const { test1Scores, switchTest } = useAppContext();

    return (
        <div className="min-h-screen flex flex-col relative">
            <TopNav />
            <div className="flex-1 flex flex-col justify-center items-center p-8">
                <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
                <div className="max-w-5xl w-full bg-white rounded-lg border-2 md:border-4 border-black shadow-retro-lg p-4 md:p-8 text-center space-y-4 md:space-y-6 animate-fade-in z-10">
                    <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight">Ce que tu viens de tester</h2>

                    <div className="grid grid-cols-3 gap-2 md:gap-8 py-2 md:py-8 border-t-2 border-b-2 border-dashed border-gray-300">
                        <div className="text-center">
                            <div className="text-xl md:text-4xl font-black text-brand-dark mb-1 md:mb-2">{test1Scores.humanCorrect}/{test1Scores.humanTotal}</div>
                            <div className="text-gray-500 font-mono text-[9px] md:text-sm uppercase">Score humain</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl md:text-5xl font-black text-brand-blue mb-1 md:mb-2">{test1Scores.modelACorrect}/{test1Scores.modelATotal}</div>
                            <div className="text-gray-500 font-mono text-[9px] md:text-sm uppercase">Score IA A</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl md:text-5xl font-black text-brand-orange mb-1 md:mb-2">{test1Scores.modelBCorrect}/{test1Scores.modelBTotal}</div>
                            <div className="text-gray-500 font-mono text-[9px] md:text-sm uppercase">Score IA B</div>
                        </div>
                    </div>

                    <div className="text-left space-y-4 max-w-5xl mx-auto bg-gray-50 p-4 rounded-lg border-2 border-black">
                        <p className="text-sm text-gray-800 leading-snug">
                            <strong className="text-brand-dark uppercase bg-brand-dark/10 px-2 py-1 rounded text-xs">Mode flash</strong><br />
                            L'image apparaît brièvement. Ton cerveau décide avec peu d'infos : formes incomplètes, détails manquants. D'où les erreurs.
                        </p>
                        <p className="text-sm text-gray-800 leading-snug">
                            <strong className="text-brand-dark uppercase bg-brand-dark/10 px-2 py-1 rounded text-xs">Comment l'IA répond</strong><br />
                            L'IA ne réfléchit pas. Elle calcule des scores "chat" et "pas chat" appris par entraînement. Le plus élevé gagne. La confiance n'est pas une garantie.
                        </p>
                        <p className="text-sm text-gray-800 leading-snug">
                            <strong className="text-brand-dark uppercase bg-brand-dark/10 px-2 py-1 rounded text-xs">À retenir</strong><br />
                            Réussir sur images rapides = le modèle fonctionne si l'info est claire. La vraie question : que se passe-t-il si on floute l'image ?
                        </p>
                    </div>

                    <Button onClick={() => switchTest('TEST_2_STRESS')} className="w-full max-w-sm mx-auto text-xl py-4 mt-8">
                        Passer au Flou <ArrowRight className="inline ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
