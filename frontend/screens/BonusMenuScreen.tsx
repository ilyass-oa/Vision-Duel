import React from 'react';
import { Brain, Sparkles, BookOpen, Wrench } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const BonusMenuScreen: React.FC = () => {
    const { switchTest } = useAppContext();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
            <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
            <div className="max-w-3xl w-full bg-white rounded-lg border-2 md:border-4 border-black shadow-retro-lg p-6 md:p-10 text-center space-y-4 md:space-y-8 animate-fade-in z-10">
                <div className="inline-flex items-center justify-center p-3 md:p-4 bg-purple-100 border-2 border-black rounded-full text-purple-700 mb-2 md:mb-4 shadow-retro-sm">
                    <Brain size={36} className="md:hidden" />
                    <Brain size={48} className="hidden md:block" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Petit plus pour les curieux</h2>
                <p className="text-sm md:text-base text-gray-600 font-medium">Activités bonus pour aller plus loin.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <button
                        onClick={() => switchTest('BONUS_A1')}
                        className="bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-400 p-4 md:p-6 rounded-lg text-left transition-all hover:shadow-retro-sm group"
                    >
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <Sparkles size={24} className="md:hidden text-indigo-600" />
                            <Sparkles size={28} className="hidden md:block text-indigo-600" />
                            <h3 className="font-black text-base md:text-lg uppercase text-indigo-900">Bonus A</h3>
                        </div>
                        <p className="font-bold text-sm md:text-base text-indigo-800 mb-1 md:mb-2">Dans la tête du modele</p>
                        <p className="text-xs md:text-sm text-indigo-600 font-mono">Comment le modèle apprend-il ? 3 écrans, 30 secondes.</p>
                    </button>

                    <button
                        onClick={() => switchTest('BONUS_B')}
                        className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-400 p-4 md:p-6 rounded-lg text-left transition-all hover:shadow-retro-sm group"
                    >
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <BookOpen size={24} className="md:hidden text-amber-600" />
                            <BookOpen size={28} className="hidden md:block text-amber-600" />
                            <h3 className="font-black text-base md:text-lg uppercase text-amber-900">Bonus B</h3>
                        </div>
                        <p className="font-bold text-sm md:text-base text-amber-800 mb-1 md:mb-2">Surapprentissage en 30 secondes</p>
                        <p className="text-xs md:text-sm text-amber-600 font-mono">Apprendre parfaitement... ne veut pas dire généraliser.</p>
                    </button>

                    <button
                        onClick={() => switchTest('BONUS_C_INTRO')}
                        className="bg-green-50 hover:bg-green-100 border-2 border-green-400 p-4 md:p-6 rounded-lg text-left transition-all hover:shadow-retro-sm group"
                    >
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <Wrench size={24} className="md:hidden text-green-600" />
                            <Wrench size={28} className="hidden md:block text-green-600" />
                            <h3 className="font-black text-base md:text-lg uppercase text-green-900">Bonus C</h3>
                        </div>
                        <p className="font-bold text-sm md:text-base text-green-800 mb-1 md:mb-2">Atelier de Réparation</p>
                        <p className="text-xs md:text-sm text-green-600 font-mono">Diagnostiquez une panne IA et réparez-la avec de meilleures données.</p>
                    </button>

                    <button
                        onClick={() => switchTest('LAB_TRAINER')}
                        className="relative overflow-hidden bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-400 p-4 md:p-6 rounded-lg text-left transition-all hover:shadow-retro-sm group"
                    >
                        <span className="absolute top-2 right-2 bg-indigo-900 text-white border border-indigo-200 rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wide">
                            Special
                        </span>
                        <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <Brain size={24} className="md:hidden text-cyan-700" />
                            <Brain size={28} className="hidden md:block text-cyan-700" />
                            <h3 className="font-black text-base md:text-lg uppercase text-cyan-900">Bonus D</h3>
                        </div>
                        <p className="font-bold text-sm md:text-base text-cyan-800 mb-1 md:mb-2">Entraîne ton IA</p>
                        <p className="text-xs md:text-sm text-cyan-700 font-mono">4 images fixes au lancement, avec pourcentages IA visibles directement.</p>
                    </button>
                </div>

                <div className="text-center pt-6">
                    <button onClick={() => switchTest('CONCLUSION')} className="text-gray-500 hover:text-gray-800 font-mono text-sm underline">
                        Retour à la conclusion
                    </button>
                </div>
            </div>
        </div>
    );
};
