import React from 'react';
import { Button } from '../components/Button';
import { TopNav } from '../components/TopNav';
import { ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const Result2Screen: React.FC = () => {
    const { test2Scores, switchTest } = useAppContext();

    return (
        <div className="min-h-screen flex flex-col relative">
            <TopNav />
            <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8">
                <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
                <div className="max-w-5xl w-full bg-white rounded-lg border-2 md:border-4 border-black shadow-retro-lg p-4 md:p-8 text-center space-y-4 md:space-y-6 animate-fade-in z-10">
                    <h2 className="text-xl md:text-4xl font-black uppercase tracking-tight">Ce que montre la pixélisation</h2>

                    <div className="grid grid-cols-3 gap-2 md:gap-8 py-2 md:py-8 border-t-2 border-b-2 border-dashed border-gray-300">
                        <div className="text-center">
                            <div className="text-xl md:text-5xl font-black text-brand-dark mb-1 md:mb-2">{test2Scores.humanCorrect}/{test2Scores.humanTotal}</div>
                            <div className="text-gray-500 font-mono text-[9px] md:text-sm uppercase">Score humain</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl md:text-5xl font-black text-brand-blue mb-1 md:mb-2">{test2Scores.modelACorrect}/{test2Scores.modelATotal}</div>
                            <div className="text-gray-500 font-mono text-[9px] md:text-sm uppercase">Score IA A</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl md:text-5xl font-black text-brand-orange mb-1 md:mb-2">{test2Scores.modelBCorrect}/{test2Scores.modelBTotal}</div>
                            <div className="text-gray-500 font-mono text-[9px] md:text-sm uppercase">Score IA B</div>
                        </div>
                    </div>
                    <div className="text-xs md:text-sm font-mono text-gray-500 uppercase pb-2 md:pb-4">Niveaux de pixélisation utilisés : Léger, Moyen, Fort</div>

                    <div className="text-left space-y-6 max-w-5xl mx-auto bg-gray-50 p-6 rounded-lg border-2 border-black">
                        <p className="text-base text-gray-800 leading-relaxed">
                            Quand on pixélise une image, on supprime une partie de l'information : les détails fins disparaissent et il ne reste que des formes grossières. Dans cette étape, toi et les IA avez pris une décision sur <strong className="bg-yellow-200 px-1">exactement la même image dégradée</strong>.
                        </p>
                        <p className="text-base text-gray-800 leading-relaxed">
                            Ce test montre une limite simple mais importante : un modèle peut être très bon quand l'image est "propre", puis perdre en fiabilité dès qu'on réduit la qualité. La différence vient souvent de ce que le modèle a apprit à utiliser : des détails fragiles (textures, petits motifs) ou des indices plus robustes (formes générales).
                        </p>
                        <p className="text-base text-gray-800 leading-relaxed font-bold bg-brand-dark/10 p-4 rounded border-l-4 border-brand-dark">
                            Ce qu’il faut retenir  : pour juger une IA, il ne suffit pas de regarder si elle réussit sur des images parfaites. Il faut vérifier comment elle se comporte quand l'information se dégrade, car c'est ce qui arrive souvent en conditions réelles.
                        </p>
                    </div>

                    <Button onClick={() => switchTest('TEST_3_UNCERTAINTY')} className="w-full max-w-sm mx-auto text-xl py-4 mt-8">
                        Dernier test : Faux Amis <ArrowRight className="inline ml-2" />
                    </Button>
                    <p className="text-sm text-gray-500 font-mono pt-2">Étape suivante : on va tester des cas où l'image ressemble à un chat... sans être un chat.</p>
                </div>
            </div>
        </div>
    );
};
