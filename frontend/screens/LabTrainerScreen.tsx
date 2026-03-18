import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { useAppContext } from '../context/AppContext';
import { fetchLabInfo, trainLabModel, fetchLabPrediction, LabInfoResponse, LabTrainResponse } from '../api';

type LabOverlayPrediction = { chatPct: number; pasChatPct: number };

export const LabTrainerScreen: React.FC = () => {
    const { labImages, switchTest } = useAppContext();

    const [labInfo, setLabInfo] = useState<LabInfoResponse | null>(null);
    const [labSelectedSize, setLabSelectedSize] = useState(500);
    const [labTraining, setLabTraining] = useState<LabTrainResponse | null>(null);
    const [labTrainLoading, setLabTrainLoading] = useState(false);
    const [labPredictLoading, setLabPredictLoading] = useState(false);
    const [labPredictions, setLabPredictions] = useState<Record<string, LabOverlayPrediction>>({});
    const [labError, setLabError] = useState<string | null>(null);

    useEffect(() => {
        fetchLabInfo()
            .then(info => {
                setLabInfo(info);
                if (info?.levels?.length && !info.levels.includes(labSelectedSize)) {
                    setLabSelectedSize(info.levels[0]);
                }
            })
            .catch(err => console.error("Failed to load lab info:", err));
    }, []);

    const trainLab = async () => {
        setLabTrainLoading(true);
        setLabPredictLoading(false);
        setLabError(null);
        setLabPredictions({});
        try {
            const result = await trainLabModel(labSelectedSize);
            setLabTraining(result);

            if (labImages.length === 0) {
                setLabError("Aucune image de démonstration disponible pour afficher les pourcentages.");
                return;
            }

            setLabPredictLoading(true);
            const overlays = await Promise.all(
                labImages.map(async (img) => {
                    const prediction = await fetchLabPrediction(img.id);
                    const chatPct = prediction.model.label === 'CHAT'
                        ? prediction.model.confidence
                        : 100 - prediction.model.confidence;
                    const pasChatPct = 100 - chatPct;

                    return [
                        img.id,
                        {
                            chatPct: Number(chatPct.toFixed(1)),
                            pasChatPct: Number(pasChatPct.toFixed(1)),
                        },
                    ] as const;
                })
            );

            setLabPredictions(Object.fromEntries(overlays));
        } catch (err) {
            console.error("Lab training failed:", err);
            setLabError("Impossible d'entraîner le modèle. Réessayez dans quelques secondes.");
        } finally {
            setLabTrainLoading(false);
            setLabPredictLoading(false);
        }
    };

    const levels = labInfo?.levels?.length ? labInfo.levels : [250, 500, 700, 1000];

    return (
        <div className="min-h-screen flex flex-col p-4 md:p-8 relative">
            <div className="absolute inset-0 bg-dot-pattern opacity-45 pointer-events-none"></div>

            <div className="max-w-6xl w-full mx-auto bg-white border-2 md:border-4 border-black rounded-lg shadow-retro-lg p-4 md:p-8 space-y-4 md:space-y-6 z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight">Entraîne ton IA</h2>
                        <p className="text-sm text-gray-600 font-mono mt-1">
                            Choisis une taille d'entrainement puis regarde les pourcentages de l'IA sur 4 images tirees au hasard au lancement du site.
                        </p>
                    </div>
                    <Button variant="secondary" onClick={() => switchTest('BONUS_MENU')} className="text-sm md:text-base px-4 py-2">
                        Retour bonus
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-gray-50 border-2 border-black rounded-lg p-4 space-y-4">
                        <h3 className="text-lg font-black uppercase">1) Entrainement</h3>
                        <p className="text-sm text-gray-700">Choisis une taille puis lance l'entrainement.</p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {levels.map(level => (
                                <button
                                    key={level}
                                    onClick={() => setLabSelectedSize(level)}
                                    className={`border-2 border-black rounded py-2 text-sm font-mono font-bold transition-colors ${labSelectedSize === level ? 'bg-black text-white' : 'bg-white hover:bg-gray-100'}`}
                                >
                                    {level} images
                                </button>
                            ))}
                        </div>

                        <Button onClick={trainLab} disabled={labTrainLoading} className="w-full text-base md:text-lg py-3">
                            {labTrainLoading ? 'Entrainement en cours...' : `Entrainer avec ${labSelectedSize} images`}
                        </Button>

                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="bg-white border border-black rounded p-2">
                                <div className="text-xs font-mono text-gray-500 uppercase">Train</div>
                                <div className="text-xl font-black">{labTraining ? `${labTraining.train_accuracy}%` : '--'}</div>
                            </div>
                            <div className="bg-white border border-black rounded p-2">
                                <div className="text-xs font-mono text-gray-500 uppercase">Validation</div>
                                <div className="text-xl font-black">{labTraining ? `${labTraining.val_accuracy}%` : '--'}</div>
                            </div>
                        </div>

                        <div className="text-xs font-mono text-gray-500">
                            Banque de donnees: {labInfo ? `${labInfo.chat_pool} chats / ${labInfo.pas_chat_pool} pas chats` : 'chargement...'}
                        </div>
                    </div>

                    <div className="bg-gray-50 border-2 border-black rounded-lg p-4 space-y-4">
                        <h3 className="text-lg font-black uppercase">2) Démonstration</h3>
                        <p className="text-sm text-gray-700">
                            Les pourcentages représentent les décisions de l'IA.
                            <span className="block mt-1">
                                <span className="font-bold text-emerald-700">Vert = Chat</span>,{' '}
                                <span className="font-bold text-red-700">Rouge = Pas chat</span>
                            </span>
                        </p>

                        {labPredictLoading && (
                            <div className="text-sm font-mono text-gray-600">Calcul des pourcentages en cours...</div>
                        )}

                        <div className="border-2 border-black rounded-lg bg-white p-2">
                            <div className="grid grid-cols-2 gap-2">
                                {labImages.map((image) => {
                                    const overlay = labPredictions[image.id];
                                    return (
                                        <div key={image.id} className="relative aspect-square bg-white border border-black rounded overflow-hidden">
                                            <img src={image.url} alt={image.id} className="w-full h-full object-contain" />

                                            {overlay ? (
                                                <>
                                                    <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-emerald-600/70 text-white text-[11px] md:text-xs font-black px-2 py-0.5 rounded border border-emerald-200">
                                                        {overlay.chatPct}%
                                                    </div>
                                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-red-600/70 text-white text-[11px] md:text-xs font-black px-2 py-0.5 rounded border border-red-200">
                                                        {overlay.pasChatPct}%
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                                                    <span className="text-white text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50">En attente</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {labImages.length === 0 && (
                            <div className="text-sm text-gray-600 font-mono">Aucune image disponible pour le moment.</div>
                        )}
                    </div>
                </div>

                {labError && (
                    <div className="bg-red-50 border-2 border-red-300 text-red-700 rounded p-3 text-sm">
                        {labError}
                    </div>
                )}
            </div>
        </div>
    );
};
