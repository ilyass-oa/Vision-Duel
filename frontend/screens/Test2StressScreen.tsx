import React, { useState, useEffect } from 'react';
import { StageProgress } from '../components/StageProgress';
import { AICard } from '../components/AICard';
import { Button } from '../components/Button';
import { TopNav } from '../components/TopNav';
import { ArrowRight } from 'lucide-react';
import { MODEL_A, MODEL_B } from '../constants';
import { useAppContext } from '../context/AppContext';
import { fetchTransformedPredictions } from '../api';
import { Prediction } from '../types';

type Test2Phase = 'IDLE' | 'LOADING' | 'BLURRED_VIEW' | 'TRUTH_REVEAL';

export const Test2StressScreen: React.FC = () => {
    const { test2Images, test2Scores, setTest2Scores, completedTests, setCompletedTests, switchTest } = useAppContext();

    const [test2Phase, setTest2Phase] = useState<Test2Phase>('IDLE');
    const [test2Index, setTest2Index] = useState(0);
    const [test2HasAnswered, setTest2HasAnswered] = useState(false);
    const [blurredImageB64, setBlurredImageB64] = useState<string | null>(null);
    const [predA, setPredA] = useState<Prediction | undefined>();
    const [predB, setPredB] = useState<Prediction | undefined>();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (test2Phase !== 'LOADING' || test2Images.length === 0) return;

        setIsAnalyzing(true);
        fetchTransformedPredictions(test2Images[test2Index].id, ['blur'])
            .then(result => {
                setPredA({ label: result.model_a.label, confidence: result.model_a.confidence });
                setPredB({ label: result.model_b.label, confidence: result.model_b.confidence });
                setBlurredImageB64(result.transformed_base64 || null);
                setIsAnalyzing(false);
                setTest2Phase('BLURRED_VIEW');
            })
            .catch(err => {
                console.error("Test 2 Prediction error:", err);
                setIsAnalyzing(false);
                setTest2Phase('BLURRED_VIEW');
            });
    }, [test2Phase, test2Images, test2Index]);

    const handleTest2Answer = (userAnswer: 'CHAT' | 'PAS_CHAT') => {
        if (test2Phase !== 'BLURRED_VIEW' || test2Images.length === 0 || test2HasAnswered) return;

        setTest2HasAnswered(true);
        setTest2Phase('TRUTH_REVEAL');
        const truth = test2Images[test2Index].truth;

        if (predA && predB) {
            setTest2Scores(prev => ({
                humanCorrect: prev.humanCorrect + (userAnswer === truth ? 1 : 0),
                humanTotal: prev.humanTotal + 1,
                modelACorrect: prev.modelACorrect + (predA.label === truth ? 1 : 0),
                modelATotal: prev.modelATotal + 1,
                modelBCorrect: prev.modelBCorrect + (predB.label === truth ? 1 : 0),
                modelBTotal: prev.modelBTotal + 1,
            }));
        }
    };

    const goToNextTest2 = () => {
        if (test2Index < test2Images.length - 1) {
            setTest2Index(prev => prev + 1);
            setTest2HasAnswered(false);
            setPredA(undefined);
            setPredB(undefined);
            setBlurredImageB64(null);
            setTest2Phase('LOADING');
        } else {
            setCompletedTests(new Set([...completedTests, 'TEST_2_STRESS']));
            switchTest('RESULT_2');
        }
    };

    const currentImg = test2Images[test2Index];
    const isTestOngoing = test2Phase !== 'IDLE';

    return (
        <div className="min-h-screen flex flex-col">
            <TopNav isLocked={isTestOngoing} />
            <StageProgress currentStage={2} totalStages={3} title="Test 2 : Flou" subtitle={`Image ${test2Index + 1} / ${test2Images.length} — Même flou pour tout le monde`} />
            <div className="flex-1 flex flex-col md:flex-row p-3 md:p-6 gap-4 md:gap-8 max-w-7xl mx-auto w-full">
                <div className="flex-[2] flex flex-col justify-center space-y-3 md:space-y-6">
                    <div className="relative aspect-square md:aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-retro border-2 md:border-4 border-black p-1 md:p-2 bg-white" style={{ maxHeight: '50vh' }}>
                        <div className="w-full h-full border-2 border-black overflow-hidden relative bg-black">
                            {test2Phase !== 'IDLE' && (
                                <>
                                    {test2Phase === 'TRUTH_REVEAL' && currentImg && (
                                        <div className={`absolute top-4 left-4 z-30 bg-white border-2 border-black px-3 py-1 text-sm font-black font-mono shadow-retro-sm uppercase ${currentImg.truth === 'CHAT' ? 'text-green-600' : 'text-red-600'}`}>
                                            {currentImg.truth === 'CHAT' ? 'CHAT' : 'PAS CHAT'}
                                        </div>
                                    )}
                                    <div className="w-full h-full overflow-hidden flex items-center justify-center">
                                        {test2Phase === 'LOADING' ? (
                                            <div className="text-white font-mono animate-pulse uppercase tracking-widest text-sm">Application du flou...</div>
                                        ) : test2Phase === 'TRUTH_REVEAL' && currentImg ? (
                                            <img src={currentImg.url} alt="Original" className="w-full h-full object-contain animate-fade-in" />
                                        ) : blurredImageB64 ? (
                                            <img src={`data:image/jpeg;base64,${blurredImageB64}`} alt="Floutée" className="w-full h-full object-contain animate-fade-in" />
                                        ) : null}
                                    </div>
                                    <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded border border-white/20 text-xs font-mono uppercase tracking-widest z-20">
                                        Flou constant
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="h-16 md:h-20 flex flex-col justify-center">
                        {test2Phase === 'IDLE' ? (
                            <Button onClick={() => setTest2Phase('LOADING')} className="w-full h-14 md:h-20 text-base md:text-xl font-bold">Lancer le duel</Button>
                        ) : test2Phase === 'BLURRED_VIEW' && (
                            <div className="grid grid-cols-2 gap-3 md:gap-6 animate-fade-in">
                                <Button onClick={() => handleTest2Answer('PAS_CHAT')} disabled={isAnalyzing} className="h-14 md:h-20 text-base md:text-xl" variant="secondary">PAS CHAT</Button>
                                <Button onClick={() => handleTest2Answer('CHAT')} disabled={isAnalyzing} className="h-14 md:h-20 text-base md:text-xl">CHAT</Button>
                            </div>
                        )}
                        {test2Phase === 'TRUTH_REVEAL' && (
                            <div className="flex justify-center animate-fade-in">
                                <Button onClick={goToNextTest2} className="px-8 md:px-12 h-14 md:h-20 text-base md:text-lg">
                                    {test2Index < test2Images.length - 1 ? 'Suivant' : 'Voir les résultats'} <ArrowRight className="inline ml-2" size={20} />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Live scoreboard Test 2 */}
                    <div className={`grid grid-cols-3 gap-2 md:gap-4 text-center bg-white border-2 border-black rounded p-2 md:p-4 shadow-retro-sm transition-opacity duration-300 ${test2Scores.humanTotal > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div>
                            <div className="text-lg md:text-2xl font-black text-brand-dark">{test2Scores.humanCorrect}/{test2Scores.humanTotal}</div>
                            <div className="text-[10px] md:text-xs text-gray-500 font-mono uppercase">Toi</div>
                        </div>
                        <div>
                            <div className="text-lg md:text-2xl font-black text-brand-blue">{test2Scores.modelACorrect}/{test2Scores.modelATotal}</div>
                            <div className="text-[10px] md:text-xs text-gray-500 font-mono uppercase">IA A</div>
                        </div>
                        <div>
                            <div className="text-lg md:text-2xl font-black text-brand-orange">{test2Scores.modelBCorrect}/{test2Scores.modelBTotal}</div>
                            <div className="text-[10px] md:text-xs text-gray-500 font-mono uppercase">IA B</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex-1"><AICard model={MODEL_A} prediction={predA} loading={isAnalyzing || test2Phase === 'LOADING'} masked={!test2HasAnswered} /></div>
                    <div className="flex-1"><AICard model={MODEL_B} prediction={predB} loading={isAnalyzing || test2Phase === 'LOADING'} masked={!test2HasAnswered} /></div>
                </div>
            </div>
        </div>
    );
};
