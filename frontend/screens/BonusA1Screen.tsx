import React from 'react';
import { Button } from '../components/Button';
import { ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const BonusA1Screen: React.FC = () => {
    const { test1Images, switchTest } = useAppContext();
    const sampleImg = test1Images[0];

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
            <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
            <div className="max-w-3xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-10 space-y-8 animate-fade-in z-10">
                <div className="text-center">
                    <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full border border-indigo-300 font-mono text-xs font-bold uppercase">Bonus A - Écran 1/3</span>
                    <h2 className="text-3xl font-black uppercase tracking-tight mt-4">Avant l'apprentissage</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 aspect-square bg-gray-100 border-2 border-black rounded overflow-hidden p-1">
                        {sampleImg && <img src={sampleImg.url} alt="Before" className="w-full h-full object-contain opacity-70" />}
                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="bg-gray-100 border-2 border-black rounded-lg p-6">
                            <div className="text-center">
                                <span className="text-lg font-black uppercase text-gray-500">Prédiction :</span>
                                <div className="text-3xl font-black text-gray-400 mt-2">Chat ?</div>
                            </div>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs font-mono mb-1"><span>CHAT</span><span>52%</span></div>
                                    <div className="h-4 bg-gray-200 rounded-full border border-black overflow-hidden">
                                        <div className="h-full bg-gray-400 rounded-full" style={{ width: '52%' }}></div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs font-mono mb-1"><span>PAS CHAT</span><span>48%</span></div>
                                    <div className="h-4 bg-gray-200 rounded-full border border-black overflow-hidden">
                                        <div className="h-full bg-gray-400 rounded-full" style={{ width: '48%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center italic text-gray-500 font-mono text-sm">
                            "Au début, il ne sait rien, il hésite."<br />
                            Les prédictions sont proches du hasard (50/50).
                        </p>
                    </div>
                </div>

                <div className="flex justify-center">
                    <Button onClick={() => switchTest('BONUS_A2')}>
                        Suivant <ArrowRight className="inline ml-2" size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};
