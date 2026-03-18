import React, { useState } from 'react';
import { StageProgress } from '../components/StageProgress';
import { AICard } from '../components/AICard';
import { Button } from '../components/Button';
import { TopNav } from '../components/TopNav';
import { ArrowRight } from 'lucide-react';
import { MODEL_A, MODEL_B } from '../constants';
import { useAppContext } from '../context/AppContext';
import { fetchPredictions } from '../api';
import { Prediction } from '../types';

type Test3Phase = 'IDLE' | 'STARTED';

export const Test3UncertaintyScreen: React.FC = () => {
    const { test3Images, test3Scores, setTest3Scores, completedTests, setCompletedTests, switchTest } = useAppContext();

    const [test3Phase, setTest3Phase] = useState<Test3Phase>('IDLE');
    const [test3Index, setTest3Index] = useState(0);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [predA, setPredA] = useState<Prediction | undefined>();
    const [predB, setPredB] = useState<Prediction | undefined>();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleTest3Answer = async (userAnswer: 'CHAT' | 'PAS_CHAT' | 'IDK') => {
        if (hasAnswered || test3Images.length === 0) return;
        setIsAnalyzing(true);
        setHasAnswered(true);

        try {
            const img = test3Images[test3Index];
            const result = await fetchPredictions(img.id);
            const truth = result.truth; // always PAS_CHAT for LookAlike

            const pA: Prediction = { label: result.model_a.label, confidence: result.model_a.confidence };
            const pB: Prediction = { label: result.model_b.label, confidence: result.model_b.confidence };
            setPredA(pA);
            setPredB(pB);

            // Track scores
            const humanCorrect = userAnswer === 'IDK' ? 0 : (userAnswer === truth ? 1 : 0);

            setTest3Scores(prev => ({
                humanCorrect: prev.humanCorrect + humanCorrect,
                humanTotal: prev.humanTotal + 1,
                modelACorrect: prev.modelACorrect + (result.model_a.label === truth ? 1 : 0),
                modelATotal: prev.modelATotal + 1,
                modelBCorrect: prev.modelBCorrect + (result.model_b.label === truth ? 1 : 0),
                modelBTotal: prev.modelBTotal + 1,
            }));
        } catch (err) {
            console.error("Prediction error:", err);
        }
        setIsAnalyzing(false);
    };

    const goToNextTest3 = () => {
        if (test3Index < test3Images.length - 1) {
            setTest3Index(prev => prev + 1);
            setPredA(undefined);
            setPredB(undefined);
            setHasAnswered(false);
        } else {
            setCompletedTests(new Set([...completedTests, 'TEST_3_UNCERTAINTY']));
            switchTest('RESULT_3');
        }
    };

    const currentImg = test3Images[test3Index];
    const isTestOngoing = test3Phase !== 'IDLE';

    return (
        <div className="min-h-screen flex flex-col">
            <TopNav isLocked={isTestOngoing} />
            <StageProgress currentStage={3} totalStages={3} title="Test 3 : Faux Amis" subtitle={`Image ${test3Index + 1} / ${test3Images.length} — Est-ce vraiment un chat ?`} />
            <div className="bg-white border-b-4 border-black p-3 md:p-4">
                <div className="max-w-3xl mx-auto text-center">
                    <p className="text-xs md:text-sm text-gray-600 font-mono">
                        Ces images <strong>ressemblent à des chats</strong> sans en être forcément. L'IA va-t-elle se laisser piéger ?
                    </p>
                </div>
            </div>
            <div className="flex-1 flex flex-col md:flex-row p-3 md:p-6 gap-4 md:gap-8 max-w-7xl mx-auto w-full">
                <div className="flex-[2] flex flex-col justify-center space-y-3 md:space-y-6">
                    <div className="relative aspect-square md:aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-retro border-2 md:border-4 border-black p-1 md:p-2 bg-white" style={{ maxHeight: '50vh' }}>
                        <div className="w-full h-full border-2 border-black overflow-hidden relative">
                            {test3Phase === 'STARTED' && (
                                <>
                                    {hasAnswered && currentImg && (
                                        <div className={`absolute top-4 left-4 z-30 bg-white border-2 border-black px-3 py-1 text-sm font-black font-mono shadow-retro-sm uppercase text-red-600`}>
                                            PAS CHAT (faux ami)
                                        </div>
                                    )}
                                    {currentImg && <img src={currentImg.url} alt="Uncertainty Test" className="w-full h-full object-contain" key={test3Index} />}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="h-16 md:h-20 flex flex-col justify-center">
                        {test3Phase === 'IDLE' ? (
                            <Button onClick={() => setTest3Phase('STARTED')} className="w-full h-14 md:h-20 text-base md:text-xl font-bold">Lancer le duel</Button>
                        ) : !hasAnswered ? (
                            <div className="grid grid-cols-3 gap-2 md:gap-4 " style={{ position: 'relative', zIndex: 10 }}>
                                <Button onClick={() => handleTest3Answer('PAS_CHAT')} disabled={isAnalyzing} variant="secondary" className="text-sm md:text-lg h-14 md:h-16">PAS CHAT</Button>
                                <Button onClick={() => handleTest3Answer('IDK')} disabled={isAnalyzing} className="bg-brand-dark text-white hover:bg-black border-2 border-black text-sm md:text-lg h-14 md:h-16">JE NE SAIS PAS</Button>
                                <Button onClick={() => handleTest3Answer('CHAT')} disabled={isAnalyzing} className="text-sm md:text-lg h-14 md:h-16">CHAT</Button>
                            </div>
                        ) : (
                            <div className="flex justify-center" style={{ position: 'relative', zIndex: 10 }}>
                                <Button onClick={goToNextTest3} className="px-8 md:px-12 py-3 md:py-4 text-base md:text-lg">
                                    {test3Index < test3Images.length - 1 ? 'Suivant' : 'Voir les résultats'} <ArrowRight className="inline ml-2" size={20} />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Live scoreboard Test 3 */}
                    <div className={`grid grid-cols-3 gap-2 md:gap-4 text-center bg-white border-2 border-black rounded p-2 md:p-4 shadow-retro-sm transition-opacity duration-300 ${test3Scores.humanTotal > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div>
                            <div className="text-lg md:text-2xl font-black text-brand-dark">{test3Scores.humanCorrect}/{test3Scores.humanTotal}</div>
                            <div className="text-[10px] md:text-xs text-gray-500 font-mono uppercase">Toi</div>
                        </div>
                        <div>
                            <div className="text-lg md:text-2xl font-black text-brand-blue">{test3Scores.modelACorrect}/{test3Scores.modelATotal}</div>
                            <div className="text-[10px] md:text-xs text-gray-500 font-mono uppercase">IA A</div>
                        </div>
                        <div>
                            <div className="text-lg md:text-2xl font-black text-brand-orange">{test3Scores.modelBCorrect}/{test3Scores.modelBTotal}</div>
                            <div className="text-[10px] md:text-xs text-gray-500 font-mono uppercase">IA B</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-6">
                    <div className="flex-1"><AICard model={MODEL_A} prediction={predA} loading={isAnalyzing} showUncertainty={true} masked={!hasAnswered} /></div>
                    <div className="flex-1"><AICard model={MODEL_B} prediction={predB} loading={isAnalyzing} showUncertainty={true} masked={!hasAnswered} /></div>
                </div>
            </div>
        </div>
    );
};
