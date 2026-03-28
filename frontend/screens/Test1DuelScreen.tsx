import React, { useState, useEffect } from 'react';
import { StageProgress } from '../components/StageProgress';
import { AICard } from '../components/AICard';
import { Button } from '../components/Button';
import { TopNav } from '../components/TopNav';
import { ArrowRight } from 'lucide-react';
import { MODEL_A, MODEL_B } from '../constants';
import { useAppContext } from '../context/AppContext';
import { fetchPredictions } from '../api';
import { Prediction } from '../types';

type Test1Phase = 'IDLE' | 'COUNTDOWN' | 'FLASHING' | 'ANSWERING' | 'REVEALED';

export const Test1DuelScreen: React.FC = () => {
    const { test1Images, test1Scores, setTest1Scores, completedTests, setCompletedTests, switchTest } = useAppContext();

    const [test1Phase, setTest1Phase] = useState<Test1Phase>('IDLE');
    const [test1Index, setTest1Index] = useState(0);
    const [countdown, setCountdown] = useState(3);
    const [predA, setPredA] = useState<Prediction | undefined>();
    const [predB, setPredB] = useState<Prediction | undefined>();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [hasAnswered, setHasAnswered] = useState(false);

    // Phase 1: Countdown
    useEffect(() => {
        if (test1Phase !== 'COUNTDOWN') return;

        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(prev => prev - 1), 600);
            return () => clearTimeout(timer);
        } else {
            setTest1Phase('FLASHING');
        }
    }, [test1Phase, countdown]);

    // Phase 2: Flash
    useEffect(() => {
        if (test1Phase !== 'FLASHING') return;

        // Start AI analysis exactly when the human sees the image
        if (!predA && !isAnalyzing && test1Images.length > test1Index) {
            setIsAnalyzing(true);
            fetchPredictions(test1Images[test1Index].id).then(result => {
                setPredA({ label: result.model_a.label, confidence: result.model_a.confidence });
                setPredB({ label: result.model_b.label, confidence: result.model_b.confidence });
                setIsAnalyzing(false);
            }).catch(err => {
                console.error("Prediction error:", err);
                setIsAnalyzing(false);
            });
        }

        const timer = setTimeout(() => {
            setTest1Phase('ANSWERING');
        }, 15)
        return () => clearTimeout(timer);
    }, [test1Phase, predA, isAnalyzing, test1Images, test1Index]);

    const startTest1Round = () => {
        setPredA(undefined);
        setPredB(undefined);
        setCountdown(3);
        setHasAnswered(false); // Reset for new round
        setTest1Phase('COUNTDOWN');
    };

    const handleTest1Answer = (userAnswer: 'CHAT' | 'PAS_CHAT') => {
        if (test1Phase !== 'ANSWERING' || test1Images.length === 0 || hasAnswered) return;
        setHasAnswered(true); // User has answered for this round
        setTest1Phase('REVEALED'); // Move to revealed phase after user answers

        const truth = test1Images[test1Index].truth;
        if (predA && predB) {
            setTest1Scores(prev => ({
                humanCorrect: prev.humanCorrect + (userAnswer === truth ? 1 : 0),
                humanTotal: prev.humanTotal + 1,
                modelACorrect: prev.modelACorrect + (predA.label === truth ? 1 : 0),
                modelATotal: prev.modelATotal + 1,
                modelBCorrect: prev.modelBCorrect + (predB.label === truth ? 1 : 0),
                modelBTotal: prev.modelBTotal + 1,
            }));
        }
    };

    const goToNextTest1 = () => {
        if (test1Index < test1Images.length - 1) {
            setTest1Index(prev => prev + 1);
            startTest1Round();
        } else {
            setCompletedTests(new Set([...completedTests, 'TEST_1_DUEL']));
            switchTest('RESULT_1');
        }
    };

    const currentImg = test1Images[test1Index];
    const isTestOngoing = test1Phase !== 'IDLE';

    return (
        <div className="min-h-screen flex flex-col">
            <TopNav isLocked={isTestOngoing} />
            <StageProgress currentStage={1} totalStages={3} title="Test 1 : Le Duel" subtitle={`Image ${test1Index + 1} / ${test1Images.length}`} />
            <div className="flex-1 flex flex-col md:flex-row p-3 md:p-6 gap-4 md:gap-8 max-w-7xl mx-auto w-full">
                <div className="flex-[2] flex flex-col justify-center space-y-3 md:space-y-6">
                    <div className="relative aspect-square md:aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-retro border-2 md:border-4 border-black p-1 md:p-2 bg-white">
                        <div className="w-full h-full border-2 border-black overflow-hidden relative">
                            <div className="absolute inset-0 pointer-events-none opacity-20 scanline z-10"></div>

                            {/* Countdown Overlay */}
                            {test1Phase === 'COUNTDOWN' && (
                                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
                                    <div className="flex flex-col items-center">
                                        <div className="text-9xl font-black text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform scale-125 animate-pop">
                                            {countdown === 0 ? 'GO!' : countdown}
                                        </div>
                                        <div className="mt-4 text-white font-mono text-sm uppercase tracking-[0.3em] font-bold">Preparez-vous</div>
                                    </div>
                                </div>
                            )}

                            {test1Phase === 'REVEALED' && currentImg && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none p-2 md:p-4">
                                    <div className={`animate-stamp font-black text-2xl md:text-4xl lg:text-6xl border-4 md:border-8 px-3 md:px-6 py-2 md:py-3 uppercase tracking-widest backdrop-blur-[2px] bg-white/40 
                    ${currentImg.truth === 'CHAT' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}`}>
                                        {currentImg.truth === 'CHAT' ? 'CHAT' : 'PAS CHAT'}
                                    </div>
                                </div>
                            )}
                            {currentImg && (
                                <img src={currentImg.url} alt="Test" className={`w-full h-full object-contain transition-none ${(test1Phase === 'FLASHING' || test1Phase === 'REVEALED') ? 'opacity-100' : 'opacity-0'}`} key={test1Index} />
                            )}
                        </div>
                    </div>

                    <div className="h-16 md:h-20 flex flex-col justify-center">
                        {test1Phase === 'ANSWERING' ? (
                            <div className="grid grid-cols-2 gap-3 md:gap-6">
                                <Button onClick={() => handleTest1Answer('PAS_CHAT')} disabled={isAnalyzing} className="h-14 md:h-20 text-base md:text-xl" variant="secondary">PAS CHAT</Button>
                                <Button onClick={() => handleTest1Answer('CHAT')} disabled={isAnalyzing} className="h-14 md:h-20 text-base md:text-xl">CHAT</Button>
                            </div>
                        ) : test1Phase === 'REVEALED' && !isAnalyzing ? (
                            <div className="flex justify-center">
                                <Button onClick={goToNextTest1} className="px-8 md:px-12 h-14 md:h-20 text-base md:text-lg">
                                    {test1Index < test1Images.length - 1 ? 'Suivant' : 'Voir les resultats'} <ArrowRight className="inline ml-2" size={20} />
                                </Button>
                            </div>
                        ) : test1Phase === 'IDLE' ? (
                            <Button onClick={startTest1Round} className="w-full h-14 md:h-20 text-base md:text-xl">Lancer le duel</Button>
                        ) : (
                            <div className="flex justify-center text-gray-400 font-mono animate-pulse">
                                {test1Phase === 'FLASHING' ? 'FLASH !' : 'Veuillez patienter...'}
                            </div>
                        )}
                    </div>

                    {/* Live scoreboard */}
                    <div className={`grid grid-cols-3 gap-2 md:gap-4 text-center bg-white border-2 border-black rounded p-2 md:p-4 shadow-retro-sm transition-opacity duration-300 ${test1Scores.humanTotal > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div>
                            <div className="text-lg md:text-2xl font-black text-brand-dark">{test1Scores.humanCorrect}/{test1Scores.humanTotal}</div>
                            <div className="text-[10px] md:text-xs text-gray-500 font-mono uppercase">Toi</div>
                        </div>
                        <div>
                            <div className="text-lg md:text-2xl font-black text-brand-blue">{test1Scores.modelACorrect}/{test1Scores.modelATotal}</div>
                            <div className="text-[10px] md:text-xs text-gray-500 font-mono uppercase">IA A</div>
                        </div>
                        <div>
                            <div className="text-lg md:text-2xl font-black text-brand-orange">{test1Scores.modelBCorrect}/{test1Scores.modelBTotal}</div>
                            <div className="text-[10px] md:text-xs text-gray-500 font-mono uppercase">IA B</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex-1"><AICard model={MODEL_A} prediction={predA} loading={isAnalyzing} masked={!hasAnswered} /></div>
                    <div className="flex-1"><AICard model={MODEL_B} prediction={predB} loading={isAnalyzing} masked={!hasAnswered} /></div>
                </div>
            </div>
        </div>
    );
};
