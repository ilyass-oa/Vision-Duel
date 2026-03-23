import React from 'react';
import { Button } from '../components/Button';
import { TRAINING_METRICS } from '../constants';
import { useAppContext } from '../context/AppContext';

export const BonusA3Screen: React.FC = () => {
    const { trainingSamplesA, test1Images, switchTest } = useAppContext();
    const sampleImg = trainingSamplesA[0] || test1Images[0];
    const trainFinal = TRAINING_METRICS.modelA_train_acc[9];
    const valFinal = TRAINING_METRICS.modelA_val_acc[9];
    const generalizationGap = (trainFinal - valFinal).toFixed(1);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
            <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
            <div className="max-w-4xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-10 space-y-8 animate-fade-in z-10">
                <div className="text-center">
                    <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full border border-indigo-300 font-mono text-xs font-bold uppercase">Bonus A - Écran 3/3</span>
                    <h2 className="text-3xl font-black uppercase tracking-tight mt-4">Ce qu&apos;il retient vraiment</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-8 items-center">
                    <div className="aspect-square bg-gray-100 border-2 border-black rounded overflow-hidden p-1 relative">
                        {sampleImg && <img src={sampleImg.url} alt="Exemple appris" className="w-full h-full object-contain" />}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-4 left-4 bg-white border-2 border-black px-2 py-1 text-[10px] font-mono font-bold uppercase shadow-retro-sm">bords</div>
                            <div className="absolute top-10 right-4 bg-white border-2 border-black px-2 py-1 text-[10px] font-mono font-bold uppercase shadow-retro-sm">forme</div>
                            <div className="absolute bottom-4 right-4 bg-white border-2 border-black px-2 py-1 text-[10px] font-mono font-bold uppercase shadow-retro-sm">texture</div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3/5 h-3/5 rounded-full bg-red-500 opacity-20 blur-xl"></div>
                            </div>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black text-white px-2 py-1 text-xs font-mono rounded">motifs utiles</div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4">
                            <div className="font-mono text-xs uppercase text-green-800 mb-1">Ce qu&apos;il a appris</div>
                            <p className="font-medium text-green-900">Associer certaines combinaisons de pixels à une réponse probable.</p>
                        </div>
                        <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4">
                            <div className="font-mono text-xs uppercase text-amber-800 mb-1">Ce qu&apos;il n&apos;a pas appris</div>
                            <p className="font-medium text-amber-900">Une définition humaine du mot “chat”. Il manipule des motifs, pas du sens.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="border-2 border-black rounded-lg p-3 bg-white">
                                <div className="font-mono text-[10px] uppercase text-gray-500">Train final</div>
                                <div className="font-black text-lg text-brand-blue">{trainFinal.toFixed(1)}%</div>
                            </div>
                            <div className="border-2 border-black rounded-lg p-3 bg-white">
                                <div className="font-mono text-[10px] uppercase text-gray-500">Validation</div>
                                <div className="font-black text-lg text-green-700">{valFinal.toFixed(1)}%</div>
                            </div>
                            <div className="border-2 border-black rounded-lg p-3 bg-white">
                                <div className="font-mono text-[10px] uppercase text-gray-500">Écart</div>
                                <div className="font-black text-lg text-amber-700">{generalizationGap} pts</div>
                            </div>
                        </div>

                        <p className="text-center italic text-gray-500 font-mono text-sm">
                            Le modèle apprend en réduisant son erreur, puis réutilise des régularités visuelles qui marchent souvent.
                        </p>
                    </div>
                </div>

                <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-4 text-center">
                    <p className="font-mono text-sm text-indigo-800 font-bold">
                        Verdict : il apprend à partir d&apos;exemples étiquetés, corrige ses erreurs, puis réagit à des motifs visuels. Il ne “comprend” pas comme nous.
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
