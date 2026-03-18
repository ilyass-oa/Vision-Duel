import React from 'react';
import { Button } from '../components/Button';
import { TopNav } from '../components/TopNav';
import { ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Result3Screen: React.FC = () => {
    const { test3Scores, switchTest } = useAppContext();

    return (
        <div className="min-h-screen flex flex-col relative">
            <TopNav />
            <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8">
                <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
                <div className="max-w-6xl w-full bg-white rounded-lg border-2 md:border-4 border-black shadow-retro-lg p-4 md:p-6 text-center space-y-3 md:space-y-4 animate-fade-in z-10">
                    <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight">Ce que montrent les "faux amis"</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 py-3 md:py-4 border-t-2 border-b-2 border-dashed border-gray-300">
                        <div className="text-center">
                            <div className="text-2xl md:text-4xl font-black text-brand-dark mb-2">{test3Scores.humanCorrect}/{test3Scores.humanTotal}</div>
                            <div className="text-gray-500 font-mono text-xs md:text-sm uppercase">Score humain</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-4xl font-black text-brand-blue mb-2">{test3Scores.modelACorrect}/{test3Scores.modelATotal}</div>
                            <div className="text-gray-500 font-mono text-xs md:text-sm uppercase">Score IA A</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl md:text-4xl font-black text-brand-orange mb-2">{test3Scores.modelBCorrect}/{test3Scores.modelBTotal}</div>
                            <div className="text-gray-500 font-mono text-xs md:text-sm uppercase">Score IA B</div>
                        </div>
                    </div>

                    <div className="text-left space-y-3 max-w-full mx-auto bg-gray-50 p-4 rounded-lg border-2 border-black">
                        <p className="text-sm text-gray-800 leading-snug">
                            Ces images étaient <strong className="bg-yellow-200 px-1">ambiguës</strong> : elles ressemblent à un chat sans en être un. Test de généralisation.
                        </p>
                        <p className="text-sm text-gray-800 leading-snug">
                            Un modèle n'a pas la notion abstraite de "chat". Il apprend des <strong>motifs visuels</strong>. Sur des cas proches mais différents, il peut se tromper avec confiance.
                        </p>
                        <p className="text-sm text-gray-800 leading-snug font-bold bg-brand-dark/10 p-3 rounded border-l-4 border-brand-dark">
                            À retenir : la performance dépend de l'entraînement. Teste les cas limites et gère l'incertitude.
                        </p>
                    </div>

                    <Button onClick={() => switchTest('CONCLUSION')} className="w-full max-w-sm mx-auto">
                        Voir la conclusion <ArrowRight className="inline ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
