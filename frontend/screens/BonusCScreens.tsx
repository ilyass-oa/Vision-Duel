import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Wrench, ArrowRight, Sun, Crop, Aperture, Eye, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const BonusCScreens: React.FC = () => {
    const { stage, switchTest, allImages } = useAppContext();

    const [bonusCFailure, setBonusCFailure] = useState<'DARK' | 'CROP' | 'FAUX_AMI' | null>(null);
    const [bonusCDiagnosis, setBonusCDiagnosis] = useState<string | null>(null);
    const [bonusCKit, setBonusCKit] = useState<string | null>(null);

    // --- Helper for Bonus C ---
    const getBonusCImages = () => {
        const chatImages = allImages.filter(img => img.truth === 'CHAT');
        const pasChatImages = allImages.filter(img => img.truth === 'PAS_CHAT');

        const darkCandidate = chatImages[0];
        const cropCandidate = chatImages[1] || chatImages[0];
        const fauxAmiCandidate = pasChatImages[0];

        return { dark: darkCandidate, crop: cropCandidate, fauxAmi: fauxAmiCandidate };
    };

    // 1. Intro
    if (stage === 'BONUS_C_INTRO') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
                <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
                <div className="max-w-2xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-10 text-center space-y-8 animate-fade-in z-10">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 border-2 border-black rounded-full text-green-700 mb-4 shadow-retro-sm">
                        <Wrench size={48} />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">Atelier de Reparation</h2>
                    <p className="text-gray-600 font-medium text-lg leading-relaxed">
                        Une IA peut "casser" dans certaines conditions imprévues.<br />
                        Votre mission : diagnostiquer la panne et choisir le bon correctif.
                    </p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 text-left font-mono text-sm text-yellow-800">
                        <strong>Rappel :</strong> Pour réparer une IA, on ne lui "explique" pas ses erreurs. On lui donne de nouveaux exemples pour qu'elle apprenne à les gérer.
                    </div>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => switchTest('BONUS_MENU')} variant="secondary">Retour</Button>
                        <Button onClick={() => { setBonusCFailure(null); setBonusCDiagnosis(null); setBonusCKit(null); switchTest('BONUS_C_SELECTION'); }}>
                            Commencer <ArrowRight className="inline ml-2" size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Selection
    if (stage === 'BONUS_C_SELECTION') {
        const candidates = getBonusCImages();
        const cases = [
            { id: 'DARK', label: 'Panne #1', img: candidates.dark, filter: 'brightness(0.4)', desc: 'Photo sombre', predA: 'PAS CHAT (30%)', predB: 'CHAT (85%)' },
            { id: 'CROP', label: 'Panne #2', img: candidates.crop, filter: 'scale(1.5)', desc: 'Cadrage serre', predA: 'PAS CHAT (42%)', predB: 'CHAT (91%)' },
            { id: 'FAUX_AMI', label: 'Panne #3', img: candidates.fauxAmi, filter: 'none', desc: 'Faux ami', predA: 'CHAT (95%)', predB: 'PAS CHAT (10%)' },
        ];

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
                <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
                <div className="z-10 w-full max-w-6xl">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-center mb-2 bg-white inline-block px-4 py-2 border-2 border-black shadow-retro-sm mx-auto">Choisir une panne</h2>
                    <p className="text-center font-mono text-gray-600 mb-8 bg-white/80 inline-block px-2">Identifiez un cas ou le modèle A échoue.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {cases.map((c) => (
                            <div key={c.id} className="bg-white border-4 border-black shadow-retro rounded-lg overflow-hidden flex flex-col">
                                <div className="h-48 bg-gray-100 relative border-b-2 border-black overflow-hidden group">
                                    {c.img && <img src={c.img.url} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" style={{ filter: c.filter }} />}
                                    <div className="absolute top-2 right-2 bg-red-600 text-white font-black px-2 py-0.5 text-xs uppercase border border-black shadow-sm transform rotate-3">Erreur</div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-black text-xl uppercase mb-1">{c.label}</h3>
                                    <p className="text-sm font-mono text-gray-500 mb-4">{c.desc}</p>

                                    <div className="space-y-2 mb-6 flex-1">
                                        <div className="flex justify-between text-xs font-mono border-b border-gray-200 pb-1">
                                            <span>IA A (Actuel)</span>
                                            <span className="font-bold text-red-600">{c.predA}</span>
                                        </div>
                                    </div>

                                    <Button onClick={() => { setBonusCFailure(c.id as any); switchTest('BONUS_C_DIAGNOSE'); }} className="w-full text-sm py-2">
                                        Diagnostiquer
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <button onClick={() => switchTest('BONUS_MENU')} className="text-gray-500 hover:text-black font-mono text-sm underline uppercase bg-white px-2">Retour</button>
                    </div>
                </div>
            </div>
        );
    }

    // 3. Diagnose
    if (stage === 'BONUS_C_DIAGNOSE') {
        const candidates = getBonusCImages();
        const defaultImg = { url: '', id: 'dummy', truth: 'CHAT', path: '' };
        let currentImg = defaultImg;
        let currentFilter = 'none';

        if (bonusCFailure === 'DARK') { currentImg = candidates.dark || defaultImg; currentFilter = 'brightness(0.4)'; }
        else if (bonusCFailure === 'CROP') { currentImg = candidates.crop || defaultImg; currentFilter = 'scale(1.5)'; }
        else if (bonusCFailure === 'FAUX_AMI') { currentImg = candidates.fauxAmi || defaultImg; currentFilter = 'none'; }

        const options = [
            { id: 'LIGHT', label: 'Manque de lumiere', icon: <Sun size={20} /> },
            { id: 'CROP', label: 'Mauvais cadrage', icon: <Crop size={20} /> },
            { id: 'BLUR', label: 'Image floue', icon: <Aperture size={20} /> },
            { id: 'LOOKALIKE', label: 'Ressemblance trompeuse', icon: <Eye size={20} /> },
        ];

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
                <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
                <div className="max-w-4xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg overflow-hidden flex flex-col md:flex-row z-10">
                    <div className="flex-1 bg-gray-100 border-b-4 md:border-b-0 md:border-r-4 border-black relative p-8 flex items-center justify-center min-h-[300px]">
                        <div className="relative w-64 h-64 border-4 border-black shadow-retro overflow-hidden bg-white">
                            {currentImg.url && <img src={currentImg.url} className="w-full h-full object-contain" style={{ filter: currentFilter }} />}
                        </div>
                        <div className="absolute top-4 left-4 bg-white border-2 border-black px-3 py-1 font-mono text-sm font-bold shadow-retro-sm">Image analysee</div>
                    </div>
                    <div className="flex-1 p-8 flex flex-col justify-center">
                        <h2 className="text-2xl font-black uppercase mb-6">Quel est le problème ?</h2>
                        <div className="grid grid-cols-1 gap-3 mb-8">
                            {options.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setBonusCDiagnosis(opt.id)}
                                    className={`flex items-center gap-3 p-4 border-2 rounded transition-all ${bonusCDiagnosis === opt.id ? 'bg-black text-white border-black transform translate-x-2' : 'bg-white border-black hover:bg-gray-50'}`}
                                >
                                    {opt.icon}
                                    <span className="font-bold font-mono">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        <Button onClick={() => switchTest('BONUS_C_KIT')} disabled={!bonusCDiagnosis}>
                            Choisir un kit <ArrowRight className="inline ml-2" size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 4. Kit Selection
    if (stage === 'BONUS_C_KIT') {
        const kits = [
            { id: 'KIT_LIGHT', label: 'Kit Lumiere', desc: '+500 photos jour/nuit', icon: <Sun size={24} />, color: 'bg-yellow-100' },
            { id: 'KIT_CROP', label: 'Kit Cadrage', desc: '+500 photos zoomees', icon: <Crop size={24} />, color: 'bg-blue-100' },
            { id: 'KIT_BLUR', label: 'Kit Nettete', desc: '+500 photos floues', icon: <Aperture size={24} />, color: 'bg-gray-100' },
            { id: 'KIT_LOOKALIKE', label: 'Kit Faux Ami', desc: '+500 contres-exemples', icon: <ShieldCheck size={24} />, color: 'bg-red-100' },
        ];

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
                <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
                <div className="max-w-4xl w-full z-10">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black uppercase inline-block bg-white px-6 py-2 border-4 border-black shadow-retro">Budget Reparation : 1 Credit</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {kits.map(kit => (
                            <button
                                key={kit.id}
                                onClick={() => setBonusCKit(kit.id)}
                                className={`relative border-4 border-black p-6 rounded-lg text-left transition-all ${bonusCKit === kit.id ? 'bg-black text-white transform -translate-y-2 shadow-retro-lg' : 'bg-white hover:bg-gray-50 shadow-retro'}`}
                            >
                                <div className={`absolute top-4 right-4 w-12 h-12 rounded-full border-2 border-black flex items-center justify-center ${bonusCKit === kit.id ? 'bg-white text-black' : kit.color}`}>
                                    {kit.icon}
                                </div>
                                <h3 className="font-black text-xl uppercase mb-1">{kit.label}</h3>
                                <p className={`font-mono text-sm ${bonusCKit === kit.id ? 'text-gray-300' : 'text-gray-500'}`}>{kit.desc}</p>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-center mt-10">
                        <Button onClick={() => switchTest('BONUS_C_RESULT')} disabled={!bonusCKit} className="px-12 py-4 text-xl">
                            Appliquer le correctif <Wrench className="inline ml-2" size={20} />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 5. Result
    if (stage === 'BONUS_C_RESULT') {
        const candidates = getBonusCImages();
        const defaultImg = { url: '', id: 'dummy', truth: 'CHAT', path: '' };
        let currentImg = defaultImg;
        let currentFilter = 'none';
        let success = false;
        let message = "";

        if (bonusCFailure === 'DARK') {
            currentImg = candidates.dark || defaultImg;
            currentFilter = 'brightness(0.4)';
            success = (bonusCKit === 'KIT_LIGHT');
            message = success ? "Correct ! En ajoutant des images sombres au dataset, le modèle reconnaît maintenant ce chat." : "Oups... Ce kit n'aide pas pour les problèmes de luminosité.";
        }
        else if (bonusCFailure === 'CROP') {
            currentImg = candidates.crop || defaultImg;
            currentFilter = 'scale(1.5)';
            success = (bonusCKit === 'KIT_CROP');
            message = success ? "Bien vu ! Le modèle a appris a reconnaître les chats même quand on ne voit qu'une partie." : "Non... Ce kit ne règle pas le problème de cadrage.";
        }
        else if (bonusCFailure === 'FAUX_AMI') {
            currentImg = candidates.fauxAmi || defaultImg;
            currentFilter = 'none';
            success = (bonusCKit === 'KIT_LOOKALIKE');
            message = success ? "Exact ! Le modèle ne confond plus ce chien avec un chat grâce aux contre-exemples." : "Raté. Le modèle continue de confondre.";
        }

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
                <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
                <div className="max-w-5xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-8 z-10">
                    <div className={`text-center mb-8 p-4 border-2 border-black rounded ${success ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
                        <h2 className="text-2xl font-black uppercase mb-2">{success ? "PANNE CORRIGEE" : "ECHEC DE LA REPARATION"}</h2>
                        <p className="font-medium">{message}</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-8">
                        <div className="flex-1 text-center opacity-50 grayscale">
                            <h3 className="font-mono font-bold uppercase mb-2 text-gray-500">Avant</h3>
                            <div className="relative aspect-square bg-gray-100 border-2 border-black rounded overflow-hidden mb-2">
                                {currentImg.url && <img src={currentImg.url} className="w-full h-full object-contain" style={{ filter: currentFilter }} />}
                                <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white font-mono text-xs font-bold py-1">ERREUR</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <ArrowRight size={40} className={success ? "text-green-500" : "text-gray-300"} />
                        </div>

                        <div className={`flex-1 text-center transform scale-110 transition-all ${success ? '' : 'opacity-50'}`}>
                            <h3 className="font-mono font-bold uppercase mb-2 text-brand-dark">Après</h3>
                            <div className={`relative aspect-square bg-gray-100 border-4 ${success ? 'border-green-500' : 'border-red-400'} rounded overflow-hidden mb-2 shadow-lg`}>
                                {currentImg.url && <img src={currentImg.url} className="w-full h-full object-contain" style={{ filter: currentFilter }} />}
                                <div className={`absolute bottom-0 left-0 right-0 ${success ? 'bg-green-600' : 'bg-red-600'} text-white font-mono text-xs font-bold py-1`}>
                                    {success ? (bonusCFailure === 'FAUX_AMI' ? "PAS CHAT (98%)" : "CHAT (95%)") : "ERREUR"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button onClick={() => switchTest('BONUS_MENU')} variant="secondary">Retour au menu</Button>
                        <Button onClick={() => switchTest('BONUS_C_SELECTION')}>Réparer une aute panne</Button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
