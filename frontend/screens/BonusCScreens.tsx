import React, { useState } from 'react';
import { Aperture, ArrowRight, Crop, Eye, ShieldCheck, Sun, Wrench } from 'lucide-react';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { ActivityImage } from '../types';

type BonusCFailure = 'DARK' | 'CROP' | 'BLUR' | 'FAUX_AMI';
type BonusCDiagnosis = 'LIGHT' | 'CROP' | 'BLUR' | 'LOOKALIKE';
type BonusCKit = 'KIT_LIGHT' | 'KIT_CROP' | 'KIT_BLUR' | 'KIT_LOOKALIKE';

const DIAGNOSIS_LABELS: Record<BonusCDiagnosis, string> = {
    LIGHT: 'Manque de lumière',
    CROP: 'Mauvais cadrage',
    BLUR: 'Image floue',
    LOOKALIKE: 'Ressemblance trompeuse',
};

const KIT_LABELS: Record<BonusCKit, string> = {
    KIT_LIGHT: 'Kit Lumière',
    KIT_CROP: 'Kit Cadrage',
    KIT_BLUR: 'Kit Netteté',
    KIT_LOOKALIKE: 'Kit Faux Ami',
};

export const BonusCScreens: React.FC = () => {
    const { stage, switchTest, allImages } = useAppContext();

    const [bonusCFailure, setBonusCFailure] = useState<BonusCFailure | null>(null);
    const [bonusCDiagnosis, setBonusCDiagnosis] = useState<BonusCDiagnosis | null>(null);
    const [bonusCKit, setBonusCKit] = useState<BonusCKit | null>(null);

    const resetBonusC = () => {
        setBonusCFailure(null);
        setBonusCDiagnosis(null);
        setBonusCKit(null);
    };

    const getBonusCImages = () => {
        const chatImages = allImages.filter((img) => img.truth === 'CHAT');
        const pasChatImages = allImages.filter((img) => img.truth === 'PAS_CHAT');

        return {
            dark: chatImages[0],
            crop: chatImages[1] || chatImages[0],
            blur: chatImages[2] || chatImages[0],
            fauxAmi: pasChatImages[0],
        };
    };

    const candidates = getBonusCImages();
    const fallbackImage: ActivityImage = { id: 'fallback', url: '', truth: 'CHAT' };

    const cases: Record<BonusCFailure, {
        label: string;
        desc: string;
        image: ActivityImage;
        imageStyle?: React.CSSProperties;
        currentPrediction: string;
        correctDiagnosis: BonusCDiagnosis;
        correctKit: BonusCKit;
        successMessage: string;
        correctedLabel: string;
        explanation: string;
    }> = {
        DARK: {
            label: 'Panne #1',
            desc: 'La scène est trop sombre.',
            image: candidates.dark || fallbackImage,
            imageStyle: { filter: 'brightness(0.35)' },
            currentPrediction: 'PAS CHAT (30%)',
            correctDiagnosis: 'LIGHT',
            correctKit: 'KIT_LIGHT',
            successMessage: 'Correct. Si on ajoute des exemples sombres à l’entraînement, le modèle apprend à rester fiable même quand la lumière change.',
            correctedLabel: 'CHAT (93%)',
            explanation: 'Le problème n’était pas le contenu, mais la luminosité. Il fallait des exemples jour / nuit.',
        },
        CROP: {
            label: 'Panne #2',
            desc: 'Le chat est trop recadré.',
            image: candidates.crop || fallbackImage,
            imageStyle: { transform: 'scale(1.55)' },
            currentPrediction: 'PAS CHAT (42%)',
            correctDiagnosis: 'CROP',
            correctKit: 'KIT_CROP',
            successMessage: 'Bien vu. En ajoutant des vues partielles et zoomées, le modèle apprend à reconnaître le chat même quand on n’en voit qu’un morceau.',
            correctedLabel: 'CHAT (91%)',
            explanation: 'Le problème venait du cadrage. Il fallait des exemples zoomés et partiels.',
        },
        BLUR: {
            label: 'Panne #3',
            desc: 'L’image est floue.',
            image: candidates.blur || fallbackImage,
            imageStyle: { filter: 'blur(6px)' },
            currentPrediction: 'PAS CHAT (38%)',
            correctDiagnosis: 'BLUR',
            correctKit: 'KIT_BLUR',
            successMessage: 'Exact. En ajoutant des images floues au dataset, le modèle apprend quels motifs restent fiables même quand les détails disparaissent.',
            correctedLabel: 'CHAT (90%)',
            explanation: 'Le problème venait bien du flou. Sans exemples flous, le modèle casse vite.',
        },
        FAUX_AMI: {
            label: 'Panne #4',
            desc: 'Un faux ami ressemble à un chat.',
            image: candidates.fauxAmi || fallbackImage,
            currentPrediction: 'CHAT (95%)',
            correctDiagnosis: 'LOOKALIKE',
            correctKit: 'KIT_LOOKALIKE',
            successMessage: 'Exact. Les contre-exemples apprennent au modèle à ne plus confondre un faux ami avec un chat.',
            correctedLabel: 'PAS CHAT (96%)',
            explanation: 'Le problème n’était ni la lumière ni le flou: l’objet se ressemblait trop à un chat.',
        },
    };

    const activeCase = bonusCFailure ? cases[bonusCFailure] : null;

    const diagnosisOptions: Array<{ id: BonusCDiagnosis; label: string; icon: React.ReactNode }> = [
        { id: 'LIGHT', label: 'Manque de lumière', icon: <Sun size={20} /> },
        { id: 'CROP', label: 'Mauvais cadrage', icon: <Crop size={20} /> },
        { id: 'BLUR', label: 'Image floue', icon: <Aperture size={20} /> },
        { id: 'LOOKALIKE', label: 'Ressemblance trompeuse', icon: <Eye size={20} /> },
    ];

    const kits: Array<{ id: BonusCKit; label: string; desc: string; icon: React.ReactNode; color: string }> = [
        { id: 'KIT_LIGHT', label: 'Kit Lumière', desc: '+500 photos jour / nuit', icon: <Sun size={24} />, color: 'bg-yellow-100' },
        { id: 'KIT_CROP', label: 'Kit Cadrage', desc: '+500 vues zoomées / partielles', icon: <Crop size={24} />, color: 'bg-blue-100' },
        { id: 'KIT_BLUR', label: 'Kit Netteté', desc: '+500 photos floues', icon: <Aperture size={24} />, color: 'bg-gray-100' },
        { id: 'KIT_LOOKALIKE', label: 'Kit Faux Ami', desc: '+500 contre-exemples proches', icon: <ShieldCheck size={24} />, color: 'bg-red-100' },
    ];

    if (stage === 'BONUS_C_INTRO') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
                <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
                <div className="max-w-2xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-10 text-center space-y-8 animate-fade-in z-10">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 border-2 border-black rounded-full text-green-700 mb-4 shadow-retro-sm">
                        <Wrench size={48} />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">Atelier de Réparation</h2>
                    <p className="text-gray-600 font-medium text-lg leading-relaxed">
                        Une IA peut casser pour plusieurs raisons : lumière, cadrage, flou ou ressemblance trompeuse.
                    </p>
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 text-left font-mono text-sm text-yellow-800">
                        <strong>Rappel :</strong> pour améliorer un modèle, on n&apos;explique pas l&apos;erreur avec des mots. On ajoute de bons exemples au dataset.
                    </div>
                    <div className="flex justify-center gap-4">
                        <Button onClick={() => { resetBonusC(); switchTest('BONUS_MENU'); }} variant="secondary">Retour</Button>
                        <Button onClick={() => { resetBonusC(); switchTest('BONUS_C_SELECTION'); }}>
                            Commencer <ArrowRight className="inline ml-2" size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (stage === 'BONUS_C_SELECTION') {
        const caseList: BonusCFailure[] = ['DARK', 'CROP', 'BLUR', 'FAUX_AMI'];

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
                <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
                <div className="z-10 w-full max-w-6xl">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-center mb-2 bg-white inline-block px-4 py-2 border-2 border-black shadow-retro-sm mx-auto">Choisir une panne</h2>
                    <p className="text-center font-mono text-gray-600 mb-8 bg-white/80 inline-block px-2">Repérez d&apos;abord ce qui a changé dans l&apos;image.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {caseList.map((caseId) => {
                            const currentCase = cases[caseId];

                            return (
                                <div key={caseId} className="bg-white border-4 border-black shadow-retro rounded-lg overflow-hidden flex flex-col">
                                    <div className="h-56 bg-gray-100 relative border-b-2 border-black overflow-hidden group">
                                        {currentCase.image.url && (
                                            <img
                                                src={currentCase.image.url}
                                                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                                                style={currentCase.imageStyle}
                                            />
                                        )}
                                        <div className="absolute top-2 right-2 bg-red-600 text-white font-black px-2 py-0.5 text-xs uppercase border border-black shadow-sm transform rotate-3">Erreur</div>
                                    </div>

                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-black text-xl uppercase mb-1">{currentCase.label}</h3>
                                        <p className="text-sm font-mono text-gray-500 mb-4">{currentCase.desc}</p>

                                        <div className="space-y-2 mb-6 flex-1">
                                            <div className="flex justify-between text-xs font-mono border-b border-gray-200 pb-1">
                                                <span>IA A (actuelle)</span>
                                                <span className="font-bold text-red-600">{currentCase.currentPrediction}</span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={() => {
                                                setBonusCFailure(caseId);
                                                setBonusCDiagnosis(null);
                                                setBonusCKit(null);
                                                switchTest('BONUS_C_DIAGNOSE');
                                            }}
                                            className="w-full text-sm py-2"
                                        >
                                            Diagnostiquer
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-center mt-8">
                        <button onClick={() => { resetBonusC(); switchTest('BONUS_MENU'); }} className="text-gray-500 hover:text-black font-mono text-sm underline uppercase bg-white px-2">Retour</button>
                    </div>
                </div>
            </div>
        );
    }

    if (stage === 'BONUS_C_DIAGNOSE' && activeCase) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
                <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
                <div className="max-w-4xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg overflow-hidden flex flex-col md:flex-row z-10">
                    <div className="flex-1 bg-gray-100 border-b-4 md:border-b-0 md:border-r-4 border-black relative p-8 flex items-center justify-center min-h-[300px]">
                        <div className="relative w-64 h-64 border-4 border-black shadow-retro overflow-hidden bg-white">
                            {activeCase.image.url && <img src={activeCase.image.url} className="w-full h-full object-contain" style={activeCase.imageStyle} />}
                        </div>
                        <div className="absolute top-4 left-4 bg-white border-2 border-black px-3 py-1 font-mono text-sm font-bold shadow-retro-sm">{activeCase.label}</div>
                    </div>

                    <div className="flex-1 p-8 flex flex-col justify-center">
                        <h2 className="text-2xl font-black uppercase mb-2">Quel est le vrai problème ?</h2>
                        <p className="text-sm text-gray-500 font-mono mb-6">{activeCase.desc}</p>

                        <div className="grid grid-cols-1 gap-3 mb-8">
                            {diagnosisOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setBonusCDiagnosis(option.id)}
                                    className={`flex items-center gap-3 p-4 border-2 rounded transition-all ${bonusCDiagnosis === option.id ? 'bg-black text-white border-black transform translate-x-2' : 'bg-white border-black hover:bg-gray-50'}`}
                                >
                                    {option.icon}
                                    <span className="font-bold font-mono">{option.label}</span>
                                </button>
                            ))}
                        </div>

                        <Button onClick={() => switchTest('BONUS_C_KIT')} disabled={!bonusCDiagnosis}>
                            Choisir le kit adapté <ArrowRight className="inline ml-2" size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (stage === 'BONUS_C_KIT' && activeCase) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
                <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
                <div className="max-w-4xl w-full z-10">
                    <div className="text-center mb-8 space-y-3">
                        <h2 className="text-3xl font-black uppercase inline-block bg-white px-6 py-2 border-4 border-black shadow-retro">Choisir un seul correctif</h2>
                        <p className="font-mono text-sm text-gray-600 bg-white inline-block px-3 py-1 border border-black">
                            Diagnostic choisi : {bonusCDiagnosis ? DIAGNOSIS_LABELS[bonusCDiagnosis] : 'aucun'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {kits.map((kit) => (
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

    if (stage === 'BONUS_C_RESULT' && activeCase) {
        const diagnosisCorrect = bonusCDiagnosis === activeCase.correctDiagnosis;
        const kitCorrect = bonusCKit === activeCase.correctKit;
        const success = diagnosisCorrect && kitCorrect;

        let message = activeCase.successMessage;
        if (!diagnosisCorrect) {
            message = `Le diagnostic n'est pas le bon. Ici, le vrai problème est : ${DIAGNOSIS_LABELS[activeCase.correctDiagnosis].toLowerCase()}.`;
        } else if (!kitCorrect) {
            message = `Le diagnostic était bon, mais pas le correctif. Il fallait : ${KIT_LABELS[activeCase.correctKit]}.`;
        }

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
                <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
                <div className="max-w-5xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-8 z-10">
                    <div className={`text-center mb-8 p-4 border-2 border-black rounded ${success ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
                        <h2 className="text-2xl font-black uppercase mb-2">{success ? 'PANNE CORRIGÉE' : 'CORRECTIF INSUFFISANT'}</h2>
                        <p className="font-medium">{message}</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-8">
                        <div className="flex-1 text-center opacity-50 grayscale">
                            <h3 className="font-mono font-bold uppercase mb-2 text-gray-500">Avant</h3>
                            <div className="relative aspect-square bg-gray-100 border-2 border-black rounded overflow-hidden mb-2">
                                {activeCase.image.url && <img src={activeCase.image.url} className="w-full h-full object-contain" style={activeCase.imageStyle} />}
                                <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white font-mono text-xs font-bold py-1">ERREUR</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <ArrowRight size={40} className={success ? 'text-green-500' : 'text-gray-300'} />
                        </div>

                        <div className={`flex-1 text-center transform scale-110 transition-all ${success ? '' : 'opacity-50'}`}>
                            <h3 className="font-mono font-bold uppercase mb-2 text-brand-dark">Après</h3>
                            <div className={`relative aspect-square bg-gray-100 border-4 ${success ? 'border-green-500' : 'border-red-400'} rounded overflow-hidden mb-2 shadow-lg`}>
                                {activeCase.image.url && <img src={activeCase.image.url} className="w-full h-full object-contain" style={activeCase.imageStyle} />}
                                <div className={`absolute bottom-0 left-0 right-0 ${success ? 'bg-green-600' : 'bg-red-600'} text-white font-mono text-xs font-bold py-1`}>
                                    {success ? activeCase.correctedLabel : 'ERREUR'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="border-2 border-black rounded-lg p-4 bg-white">
                            <p className="font-mono text-xs uppercase text-gray-500 mb-2">Diagnostic choisi</p>
                            <p className="font-bold">{bonusCDiagnosis ? DIAGNOSIS_LABELS[bonusCDiagnosis] : 'Aucun'}</p>
                            <p className="mt-3 font-mono text-xs uppercase text-gray-500 mb-2">Diagnostic attendu</p>
                            <p className="font-bold">{DIAGNOSIS_LABELS[activeCase.correctDiagnosis]}</p>
                        </div>
                        <div className="border-2 border-black rounded-lg p-4 bg-white">
                            <p className="font-mono text-xs uppercase text-gray-500 mb-2">Kit choisi</p>
                            <p className="font-bold">{bonusCKit ? KIT_LABELS[bonusCKit] : 'Aucun'}</p>
                            <p className="mt-3 font-mono text-xs uppercase text-gray-500 mb-2">Kit attendu</p>
                            <p className="font-bold">{KIT_LABELS[activeCase.correctKit]}</p>
                        </div>
                    </div>

                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-8">
                        <p className="font-mono text-xs uppercase text-green-800 mb-2">Ce qu&apos;on voulait montrer</p>
                        <p className="text-sm text-green-900 font-medium">{activeCase.explanation}</p>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button onClick={() => { resetBonusC(); switchTest('BONUS_MENU'); }} variant="secondary">Retour au menu</Button>
                        <Button onClick={() => { resetBonusC(); switchTest('BONUS_C_SELECTION'); }}>Réparer une autre panne</Button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
