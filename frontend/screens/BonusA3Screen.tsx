import React from 'react';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';

export const BonusA3Screen: React.FC = () => {
    const { test1Images, switchTest } = useAppContext();
    const sampleImg = test1Images[0];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
            <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
            <div className="max-w-3xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-10 space-y-8 animate-fade-in z-10">
                <div className="text-center">
                    <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full border border-indigo-300 font-mono text-xs font-bold uppercase">Bonus A - Ecran 3/3</span>
                    <h2 className="text-3xl font-black uppercase tracking-tight mt-4">Après l'apprentissage</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 aspect-square bg-gray-100 border-2 border-black rounded overflow-hidden p-1 relative">
                        {sampleImg && <img src={sampleImg.url} alt="After" className="w-full h-full object-contain" />}
                        {/* Simple heatmap overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-3/5 h-3/5 rounded-full bg-red-500 opacity-20 blur-xl"></div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-1 text-xs font-mono rounded">Zone importante</div>
                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="bg-green-50 border-2 border-green-600 rounded-lg p-6">
                            <div className="text-center">
                                <span className="text-lg font-black uppercase text-green-700">Prédiction :</span>
                                <div className="text-3xl font-black text-green-700 mt-2">CHAT</div>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-xs font-mono mb-1"><span>CHAT</span><span className="font-bold text-green-700">92%</span></div>
                                <div className="h-4 bg-green-200 rounded-full border border-black overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full animate-fill" style={{ width: '92%' }}></div>
                                </div>
                                <div className="flex justify-between text-xs font-mono mb-1 mt-3"><span>PAS CHAT</span><span>8%</span></div>
                                <div className="h-4 bg-gray-200 rounded-full border border-black overflow-hidden">
                                    <div className="h-full bg-gray-300 rounded-full" style={{ width: '8%' }}></div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center italic text-gray-500 font-mono text-sm">
                            "Il ne comprend pas 'un chat' comme un humain."<br />
                            "Il détecte des régularités visuelles."
                        </p>
                    </div>
                </div>

                <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-4 text-center">
                    <p className="font-mono text-sm text-indigo-800 font-bold">
                        "Le modèle ajuste des paramètres pour réduire l'erreur : il repère des motifs, pas un sens."
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
