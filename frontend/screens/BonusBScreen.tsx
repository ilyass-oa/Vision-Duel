import React from 'react';
import { Button } from '../components/Button';
import { BarChart } from '../components/BarChart';
import { TRAINING_METRICS } from '../constants';
import { useAppContext } from '../context/AppContext';

export const BonusBScreen: React.FC = () => {
    const { switchTest } = useAppContext();

    const metrics = TRAINING_METRICS;
    const aTrainFinal = metrics.modelA_train_acc[9];
    const aValFinal = metrics.modelA_val_acc[9];
    const bTrainFinal = metrics.modelB_train_acc[9];
    const bValFinal = metrics.modelB_val_acc[9];
    const aGap = (aTrainFinal - aValFinal).toFixed(1);
    const bGap = (bTrainFinal - bValFinal).toFixed(1);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
            <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
            <div className="max-w-5xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-10 space-y-8 animate-fade-in z-10">
                <div className="text-center">
                    <span className="bg-amber-100 text-amber-700 px-4 py-1 rounded-full border border-amber-300 font-mono text-xs font-bold uppercase">Bonus B</span>
                    <h2 className="text-3xl font-black uppercase tracking-tight mt-4">Apprendre par cœur ou généraliser ?</h2>
                    <p className="text-gray-500 font-mono text-sm mt-2">Le vrai test d&apos;un modèle, c&apos;est ce qu&apos;il fait sur des images nouvelles.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                        <BarChart
                            label="IA A : entraînement très propre"
                            trainScore={aTrainFinal}
                            testScore={aValFinal}
                            trainColor="bg-red-400"
                            testColor="bg-red-300"
                            tagline="Très forte sur ce qu'elle a vu"
                        />
                        <div className="mt-4 bg-white border-2 border-red-200 rounded-lg p-4 text-sm text-red-900">
                            <p><strong>Écart train/test :</strong> {aGap} points.</p>
                            <p className="mt-1">Le modèle A apprend très bien son jeu d&apos;entraînement, mais tient moins bien dès que l&apos;image change.</p>
                        </div>
                    </div>

                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                        <BarChart
                            label="IA B : entraînement plus varié"
                            trainScore={bTrainFinal}
                            testScore={bValFinal}
                            trainColor="bg-green-400"
                            testColor="bg-green-500"
                            tagline="Plus stable sur du nouveau"
                        />
                        <div className="mt-4 bg-white border-2 border-green-200 rounded-lg p-4 text-sm text-green-900">
                            <p><strong>Écart train/test :</strong> {bGap} points.</p>
                            <p className="mt-1">Le modèle B n&apos;est pas “parfait”, mais il transfère mieux ce qu&apos;il a appris à des images nouvelles.</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border-2 border-black rounded-lg p-4 bg-white">
                        <p className="font-mono text-xs uppercase text-gray-500 mb-2">Quand on surapprend</p>
                        <p className="text-sm font-medium text-gray-800">Le modèle devient excellent sur les exemples vus, mais se casse plus vite quand le monde réel dévie.</p>
                    </div>
                    <div className="border-2 border-black rounded-lg p-4 bg-white">
                        <p className="font-mono text-xs uppercase text-gray-500 mb-2">Quand on varie les exemples</p>
                        <p className="text-sm font-medium text-gray-800">On accepte parfois un score d&apos;entraînement un peu moins “parfait” pour gagner en robustesse.</p>
                    </div>
                    <div className="border-2 border-black rounded-lg p-4 bg-amber-50">
                        <p className="font-mono text-xs uppercase text-amber-700 mb-2">Verdict</p>
                        <p className="text-sm font-medium text-amber-900">Le bon modèle n&apos;est pas celui qui récite le mieux l&apos;entraînement. C&apos;est celui qui reste fiable sur du nouveau.</p>
                    </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 text-center">
                    <p className="font-mono text-sm text-amber-900 font-bold">
                        Un score “presque parfait” sur l&apos;entraînement n&apos;est pas une garantie. Ce qui compte, c&apos;est la tenue quand l&apos;image n&apos;est plus exactement comme dans le dataset.
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
