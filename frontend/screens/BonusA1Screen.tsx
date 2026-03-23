import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';

export const BonusA1Screen: React.FC = () => {
    const { trainingSamplesA, switchTest } = useAppContext();
    const visibleSamples = Array.from({ length: 4 }, (_, index) => trainingSamplesA[index] || null);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
            <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
            <div className="max-w-4xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-10 space-y-8 animate-fade-in z-10">
                <div className="text-center">
                    <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full border border-indigo-300 font-mono text-xs font-bold uppercase">Bonus A - Écran 1/3</span>
                    <h2 className="text-3xl font-black uppercase tracking-tight mt-4">Ce que le modèle reçoit</h2>
                    <p className="text-gray-600 font-medium mt-3">
                        Avant de “reconnaître”, le modèle voit surtout une suite d&apos;exemples avec la bonne réponse attendue.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
                    <div>
                        <div className="grid grid-cols-2 gap-3">
                            {visibleSamples.map((sample, index) => (
                                <div key={index} className="aspect-square bg-gray-100 border-2 border-black rounded overflow-hidden p-1 relative">
                                    {sample ? (
                                        <img src={sample.url} alt={`Training sample ${index + 1}`} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="w-full h-full animate-pulse bg-gray-200" />
                                    )}
                                    <div className="absolute bottom-2 left-2 bg-white border border-black px-2 py-0.5 text-[10px] font-mono font-bold uppercase shadow-retro-sm">
                                        Exemple
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-3 text-center text-xs font-mono text-gray-500">
                            Quelques images vues pendant l&apos;entraînement du modèle A.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            "1. Le modèle reçoit une image et la réponse attendue.",
                            "2. Il propose un score : “chat” ou “pas chat”.",
                            "3. On compare sa réponse à la vérité, puis on mesure l’erreur.",
                            "4. Cette erreur sert à corriger ses paramètres internes.",
                        ].map((step) => (
                            <div key={step} className="bg-gray-100 border-2 border-black rounded-lg p-4 font-medium text-gray-700">
                                {step}
                            </div>
                        ))}

                        <div className="bg-indigo-50 border-2 border-indigo-300 rounded-lg p-4">
                            <p className="font-mono text-sm text-indigo-900 font-bold uppercase mb-2">Mot-clé</p>
                            <p className="text-sm text-indigo-900">
                                Un <strong>epoch</strong>, c&apos;est un passage complet sur tout le dataset d&apos;entraînement.
                            </p>
                        </div>

                        <p className="text-center italic text-gray-500 font-mono text-sm">
                            Il n&apos;apprend pas avec des phrases. Il apprend avec des <strong>exemples</strong>, une <strong>erreur</strong> et des <strong>corrections</strong>.
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
