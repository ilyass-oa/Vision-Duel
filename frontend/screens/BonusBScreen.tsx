import React from 'react';
import { Button } from '../components/Button';
import { TRAINING_METRICS } from '../constants';
import { useAppContext } from '../context/AppContext';
import { BarChart } from '../components/BarChart';

export const BonusBScreen: React.FC = () => {
    const { switchTest } = useAppContext();

    const metrics = TRAINING_METRICS;
    // Model A (clean only): high train, lower on mixed test → overfitting
    const aTrainFinal = metrics.modelA_train_acc[9];
    const aValFinal = metrics.modelA_val_acc[9];
    // Model B (clean+mixed): slightly lower train, better generalization
    const bTrainFinal = metrics.modelB_train_acc[9];
    const bValFinal = metrics.modelB_val_acc[9];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
            <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
            <div className="max-w-4xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-10 space-y-8 animate-fade-in z-10">
                <div className="text-center">
                    <span className="bg-amber-100 text-amber-700 px-4 py-1 rounded-full border border-amber-300 font-mono text-xs font-bold uppercase">Bonus B</span>
                    <h2 className="text-3xl font-black uppercase tracking-tight mt-4">Surapprentissage en 30 secondes</h2>
                    <p className="text-gray-500 font-mono text-sm mt-2">Apprendre parfaitement ≠ généraliser</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                        <BarChart
                            label="Entrainement 'trop propre'"
                            trainScore={aTrainFinal}
                            testScore={aValFinal}
                            trainColor="bg-red-400"
                            testColor="bg-red-300"
                            tagline="Parfait sur ce qu'il a vu"
                        />
                    </div>
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                        <BarChart
                            label="Entraînement 'varié'"
                            trainScore={bTrainFinal}
                            testScore={bValFinal}
                            trainColor="bg-green-400"
                            testColor="bg-green-500"
                            tagline="Plus fiable sur du nouveau"
                        />
                    </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 text-center">
                    <p className="font-mono text-sm text-amber-900 font-bold">
                        "Le modèle qui a l'air parfait peut être celui qui se casse le plus dans le réel."
                    </p>
                </div>

                <div className="flex justify-center gap-4">
                    <button onClick={() => switchTest('BONUS_MENU')} className="text-gray-500 hover:text-black font-mono text-sm underline uppercase">Retour au menu bonus</button>
                    <Button onClick={() => switchTest('CONCLUSION')}>
                        Retour à la conclusion
                    </Button>
                </div>
            </div>
        </div>
    );
};
