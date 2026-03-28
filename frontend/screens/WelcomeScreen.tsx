import React from 'react';
import { Button } from '../components/Button';
import { Eye, Cat, Swords } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const WelcomeScreen: React.FC = () => {
    const { switchTest } = useAppContext();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 text-center relative overflow-hidden">
            <div className="absolute top-10 left-10 opacity-10 pointer-events-none -rotate-12 hidden md:block">
                <Eye size={120} />
            </div>
            <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none rotate-12 hidden md:block">
                <Cat size={120} />
            </div>
            <div className="max-w-2xl w-full bg-white border-4 border-black shadow-retro-lg p-6 md:p-10 rounded-lg animate-fade-in relative z-10">
                <div className="space-y-4 md:space-y-6">
                    <div className="inline-block p-3 md:p-4 rounded-full border-2 border-black bg-app-bg shadow-retro-sm mb-2 md:mb-4">
                        <Swords size={48} className="md:hidden text-brand-dark" />
                        <Swords size={64} className="hidden md:block text-brand-dark" />
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-brand-dark uppercase">
                        Vision-Duel
                    </h1>
                    <div className="h-1 w-24 bg-black mx-auto"></div>
                    <p className="text-base md:text-xl text-gray-600 font-mono">Bureau d'Analyse IA</p>
                    <p className="text-sm md:text-lg text-gray-500 font-medium">
                        Tu vas tester deux IA sur la même tâche : reconnaître un chat.<br />
                        Trois épreuves. Un verdict.
                    </p>
                </div>
                <div className="mt-6 md:mt-12 space-y-3 md:space-y-4">
                    <Button onClick={() => switchTest('BRIEFING')} className="text-base md:text-xl px-8 md:px-12 py-3 md:py-4 w-full max-w-sm mx-auto">
                        Démarrer l'inspection
                    </Button>
                    <button onClick={() => switchTest('BONUS_MENU')} className="block mx-auto text-sm text-gray-400 hover:text-gray-700 font-mono underline transition-colors">
                        Aller directement aux bonus
                    </button>
                    <Button
                        variant="outline"
                        onClick={() => switchTest('INTRO_EXPLAINER')}
                        className="text-sm md:text-base px-6 py-3 w-full max-w-sm mx-auto"
                    >
                        Voir l'animation / explication
                    </Button>
                </div>
            </div>
        </div>
    );
};
