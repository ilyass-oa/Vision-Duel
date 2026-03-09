import React, { useState, useEffect } from 'react';
import { ScreenStage, StressState, Prediction, ActivityImage, TestScores, StressResult, UncertaintyResult } from './types';
import { MODEL_A, MODEL_B, TEST_1_COUNT, TEST_2_COUNT, TEST_3_COUNT, UNCERTAINTY_THRESHOLD, TRAINING_METRICS } from './constants';
import {
  fetchAllImages,
  fetchLookAlikeImages,
  fetchTrainingSamples,
  fetchPredictions,
  fetchTransformedPredictions,
  fetchLabInfo,
  trainLabModel,
  fetchLabPrediction,
  TrainingSample,
  LabInfoResponse,
  LabTrainResponse,
} from './api';
import { Button } from './components/Button';
import { AICard } from './components/AICard';
import { StageProgress } from './components/StageProgress';
import { ArrowRight, ShieldCheck, Eye, RefreshCw, Sun, Crop, Aperture, Stamp, Brain, Sparkles, BookOpen, Wrench, Cat, Swords } from 'lucide-react';

// Standalone component for Bonus A2 to avoid conditional hooks
const BonusA2Screen: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const [visibleEpochs, setVisibleEpochs] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setVisibleEpochs(prev => {
        if (prev >= 10) { clearInterval(interval); return 10; }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const loss = TRAINING_METRICS.modelB_loss;
  const acc = TRAINING_METRICS.modelB_train_acc;
  const maxLoss = Math.max(...loss);

  const W = 400, H = 180, PAD = 30;
  const chartW = W - 2 * PAD, chartH = H - 2 * PAD;

  const lossPoints = loss.slice(0, visibleEpochs).map((v, i) => {
    const x = PAD + (i / 9) * chartW;
    const y = PAD + (1 - v / maxLoss) * chartH;
    return `${x},${y}`;
  }).join(' ');

  const accPoints = acc.slice(0, visibleEpochs).map((v, i) => {
    const x = PAD + (i / 9) * chartW;
    const y = PAD + (1 - v / 100) * chartH;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
      <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
      <div className="max-w-3xl w-full bg-white rounded-lg border-2 md:border-4 border-black shadow-retro-lg p-6 md:p-10 space-y-4 md:space-y-8 animate-fade-in z-10">
        <div className="text-center">
          <span className="bg-indigo-100 text-indigo-700 px-3 md:px-4 py-1 rounded-full border border-indigo-300 font-mono text-xs font-bold uppercase">Bonus A - Écran 2/3</span>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mt-3 md:mt-4">Pendant l'apprentissage</h2>
        </div>

        <div className="bg-gray-50 border-2 border-black rounded-lg p-6">
          <div className="flex gap-4 mb-4 justify-center">
            <span className="flex items-center gap-2 text-xs font-mono"><span className="w-3 h-3 bg-red-500 rounded-full"></span> Erreur (loss)</span>
            <span className="flex items-center gap-2 text-xs font-mono"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Réussite (%)</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 250 }}>
            {[0, 0.25, 0.5, 0.75, 1].map(frac => (
              <line key={frac} x1={PAD} y1={PAD + frac * chartH} x2={W - PAD} y2={PAD + frac * chartH} stroke="#e5e7eb" strokeWidth="1" />
            ))}
            <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#000" strokeWidth="2" />
            <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#000" strokeWidth="2" />
            <text x={W / 2} y={H - 5} textAnchor="middle" className="text-[10px]" fill="#666" fontFamily="monospace">Epochs</text>
            {visibleEpochs > 1 && (
              <polyline points={lossPoints} fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {visibleEpochs > 1 && (
              <polyline points={accPoints} fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {loss.slice(0, visibleEpochs).map((v, i) => {
              const x = PAD + (i / 9) * chartW;
              const y = PAD + (1 - v / maxLoss) * chartH;
              return <circle key={`l${i}`} cx={x} cy={y} r="4" fill="#ef4444" stroke="#000" strokeWidth="1" />;
            })}
            {acc.slice(0, visibleEpochs).map((v, i) => {
              const x = PAD + (i / 9) * chartW;
              const y = PAD + (1 - v / 100) * chartH;
              return <circle key={`a${i}`} cx={x} cy={y} r="4" fill="#22c55e" stroke="#000" strokeWidth="1" />;
            })}
          </svg>
          {visibleEpochs > 0 && (
            <div className="flex justify-between mt-4 px-4">
              <div className="text-center">
                <div className="text-red-600 font-black text-lg">{loss[Math.min(visibleEpochs - 1, 9)].toFixed(4)}</div>
                <div className="text-xs text-gray-500 font-mono">Erreur actuelle</div>
              </div>
              <div className="text-center">
                <div className="text-green-600 font-black text-lg">{acc[Math.min(visibleEpochs - 1, 9)].toFixed(1)}%</div>
                <div className="text-xs text-gray-500 font-mono">Réussite actuelle</div>
              </div>
              <div className="text-center">
                <div className="text-gray-800 font-black text-lg">{visibleEpochs}/10</div>
                <div className="text-xs text-gray-500 font-mono">Epoch</div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center italic text-gray-500 font-mono text-sm">
          "Il apprend en ajustant des nombres internes pour réduire son erreur, un peu comme une calibration."
        </p>

        <div className="flex justify-center">
          <Button onClick={onNext}>
            Suivant <ArrowRight className="inline ml-2" size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

type Test1Phase = 'IDLE' | 'COUNTDOWN' | 'FLASHING' | 'ANSWERING' | 'REVEALED';
type Test2Phase = 'IDLE' | 'LOADING' | 'PIXELATED_VIEW' | 'TRUTH_REVEAL';
type Test3Phase = 'IDLE' | 'STARTED';
type LabOverlayPrediction = { chatPct: number; pasChatPct: number };

const App: React.FC = () => {
  const [stage, setStage] = useState<ScreenStage>('WELCOME');

  // Images loaded from backend
  const [test1Images, setTest1Images] = useState<ActivityImage[]>([]);
  const [test2Images, setTest2Images] = useState<ActivityImage[]>([]);
  const [test3Images, setTest3Images] = useState<ActivityImage[]>([]);

  // Test 1 state
  const [test1Phase, setTest1Phase] = useState<Test1Phase>('IDLE');
  const [test1Index, setTest1Index] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [predA, setPredA] = useState<Prediction | undefined>();
  const [predB, setPredB] = useState<Prediction | undefined>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [test1Scores, setTest1Scores] = useState<TestScores>({
    humanCorrect: 0, humanTotal: 0,
    modelACorrect: 0, modelATotal: 0,
    modelBCorrect: 0, modelBTotal: 0,
  });

  const [hasAnswered, setHasAnswered] = useState(false);

  // Test 2 state
  const [test2Phase, setTest2Phase] = useState<Test2Phase>('IDLE');
  const [test2Index, setTest2Index] = useState(0);
  const [test2HasAnswered, setTest2HasAnswered] = useState(false);
  const [pixelatedImageB64, setPixelatedImageB64] = useState<string | null>(null);
  const [test2Scores, setTest2Scores] = useState<TestScores>({
    humanCorrect: 0, humanTotal: 0,
    modelACorrect: 0, modelATotal: 0,
    modelBCorrect: 0, modelBTotal: 0,
  });

  // Test 3 state
  const [test3Index, setTest3Index] = useState(0);
  const [test3Phase, setTest3Phase] = useState<Test3Phase>('IDLE');
  const [test3Scores, setTest3Scores] = useState<TestScores>({
    humanCorrect: 0, humanTotal: 0,
    modelACorrect: 0, modelATotal: 0,
    modelBCorrect: 0, modelBTotal: 0,
  });
  const [test3IdkCount, setTest3IdkCount] = useState(0);
  const [test3FooledImages, setTest3FooledImages] = useState<{ url: string, conf: number, model: string }[]>([]);

  // Global state
  const [completedTests, setCompletedTests] = useState<Set<string>>(new Set());
  const [showTrainingA, setShowTrainingA] = useState(false);
  const [showTrainingB, setShowTrainingB] = useState(false);
  const [trainingSamplesA, setTrainingSamplesA] = useState<TrainingSample[]>([]);
  const [trainingSamplesB, setTrainingSamplesB] = useState<TrainingSample[]>([]);
  const [allImages, setAllImages] = useState<ActivityImage[]>([]);

  // Lab activity state (new standalone activity)
  const [labInfo, setLabInfo] = useState<LabInfoResponse | null>(null);
  const [labSelectedSize, setLabSelectedSize] = useState(500);
  const [labTraining, setLabTraining] = useState<LabTrainResponse | null>(null);
  const [labTrainLoading, setLabTrainLoading] = useState(false);
  const [labPredictLoading, setLabPredictLoading] = useState(false);
  const [labImages, setLabImages] = useState<ActivityImage[]>([]);
  const [labPredictions, setLabPredictions] = useState<Record<string, LabOverlayPrediction>>({});
  const [labError, setLabError] = useState<string | null>(null);

  // Bonus C state
  const [bonusCFailure, setBonusCFailure] = useState<'DARK' | 'CROP' | 'FAUX_AMI' | null>(null);
  const [bonusCDiagnosis, setBonusCDiagnosis] = useState<string | null>(null);
  const [bonusCKit, setBonusCKit] = useState<string | null>(null);

  useEffect(() => {
    fetchAllImages()
      .then(images => {
        setAllImages(images);
        const shuffled = [...images].sort(() => Math.random() - 0.5);
        const n = shuffled.length;
        const t1End = Math.min(TEST_1_COUNT, n);
        const t2End = Math.min(t1End + TEST_2_COUNT, n);
        setTest1Images(shuffled.slice(0, t1End));
        setTest2Images(shuffled.slice(t1End, t2End));
        // 4 images are sampled once at app load for the simplified lab activity.
        setLabImages(shuffled.slice(0, Math.min(4, shuffled.length)));
      })
      .catch(err => console.error("Failed to load images:", err));

    // Load LookAlike images separately for Test 3
    fetchLookAlikeImages()
      .then(imgs => {
        const shuffled = [...imgs].sort(() => Math.random() - 0.5);
        setTest3Images(shuffled.slice(0, Math.min(TEST_3_COUNT, shuffled.length)));
      })
      .catch(err => console.error("Failed to load lookalike images:", err));

    // Load training samples
    fetchTrainingSamples()
      .then(data => {
        setTrainingSamplesA(data.model_a);
        setTrainingSamplesB(data.model_b);
      })
      .catch(err => console.error("Failed to load training samples:", err));
  }, []);

  useEffect(() => {
    fetchLabInfo()
      .then(info => setLabInfo(info))
      .catch(err => console.error("Failed to load lab info:", err));
  }, []);

  useEffect(() => {
    if (labInfo?.levels?.length && !labInfo.levels.includes(labSelectedSize)) {
      setLabSelectedSize(labInfo.levels[0]);
    }
  }, [labInfo, labSelectedSize]);

  // Test 1: DUEL (State Machine)
  // Phase 1: Countdown
  useEffect(() => {
    if (stage !== 'TEST_1_DUEL' || test1Phase !== 'COUNTDOWN') return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 600);
      return () => clearTimeout(timer);
    } else {
      setTest1Phase('FLASHING');
    }
  }, [stage, test1Phase, countdown]);

  // Phase 2: Flash
  useEffect(() => {
    if (stage !== 'TEST_1_DUEL' || test1Phase !== 'FLASHING') return;

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
    }, 70);
    return () => clearTimeout(timer);
  }, [stage, test1Phase, predA, isAnalyzing, test1Images, test1Index]);

  const startTest1Round = () => {
    setPredA(undefined);
    setPredB(undefined);
    setCountdown(3);
    setHasAnswered(false); // Reset for new round
    setTest1Phase('COUNTDOWN');
  };

  const handleTest1Answer = async (userAnswer: 'CHAT' | 'PAS_CHAT') => {
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
      setCompletedTests(prev => new Set(prev).add('TEST_1_DUEL')); setStage('RESULT_1');
    }
  };

  // ----- Test 2: PIXELATION -----
  useEffect(() => {
    if (stage !== 'TEST_2_STRESS' || test2Phase !== 'LOADING' || test2Images.length === 0) return;

    const level = test2Index < 2 ? 'light' : test2Index < 4 ? 'medium' : 'heavy';

    setIsAnalyzing(true);
    fetchTransformedPredictions(test2Images[test2Index].id, [`pixelate_${level}`])
      .then(result => {
        setPredA({ label: result.model_a.label, confidence: result.model_a.confidence });
        setPredB({ label: result.model_b.label, confidence: result.model_b.confidence });
        setPixelatedImageB64(result.transformed_base64 || null);
        setIsAnalyzing(false);
        setTest2Phase('PIXELATED_VIEW');
      })
      .catch(err => {
        console.error("Test 2 Prediction error:", err);
        setIsAnalyzing(false);
        setTest2Phase('PIXELATED_VIEW');
      });
  }, [stage, test2Phase, test2Images, test2Index]);

  const handleTest2Answer = (userAnswer: 'CHAT' | 'PAS_CHAT') => {
    if (test2Phase !== 'PIXELATED_VIEW' || test2Images.length === 0 || test2HasAnswered) return;

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
      setPixelatedImageB64(null);
      setTest2Phase('LOADING');
    } else {
      setCompletedTests(prev => new Set(prev).add('TEST_2_STRESS')); setStage('RESULT_2');
    }
  };

  // Test 3: FAUX AMIS (LookAlike)
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
      if (userAnswer === 'IDK') setTest3IdkCount(prev => prev + 1);

      setTest3Scores(prev => ({
        humanCorrect: prev.humanCorrect + humanCorrect,
        humanTotal: prev.humanTotal + 1,
        modelACorrect: prev.modelACorrect + (result.model_a.label === truth ? 1 : 0),
        modelATotal: prev.modelATotal + 1,
        modelBCorrect: prev.modelBCorrect + (result.model_b.label === truth ? 1 : 0),
        modelBTotal: prev.modelBTotal + 1,
      }));

      // Track images that fooled AIs (IA said CHAT when truth is PAS_CHAT)
      if (result.model_a.label === 'CHAT') {
        setTest3FooledImages(prev => [...prev, { url: img.url, conf: result.model_a.confidence, model: 'IA A' }]);
      }
      if (result.model_b.label === 'CHAT') {
        setTest3FooledImages(prev => [...prev, { url: img.url, conf: result.model_b.confidence, model: 'IA B' }]);
      }
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
      setCompletedTests(prev => new Set(prev).add('TEST_3_UNCERTAINTY')); setStage('RESULT_3');
    }
  };

  // Lab activity: train a simple model with increasing dataset sizes
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

  // Computed stats
  const pct = (n: number, t: number) => t > 0 ? Math.round((n / t) * 100) : 0;

  const switchTest = (targetStage: ScreenStage) => {
    if (stage === targetStage) return;

    // Always reset all tests to IDLE
    setTest1Phase('IDLE'); setTest1Index(0); setCountdown(3);
    setTest2Phase('IDLE'); setTest2Index(0); setTest2HasAnswered(false); setPixelatedImageB64(null);
    setTest3Phase('IDLE'); setTest3Index(0);

    // Global resets
    setPredA(undefined); setPredB(undefined); setHasAnswered(false); setIsAnalyzing(false);

    setStage(targetStage);
  };

  const renderTopNav = () => {
    const isTestOngoing =
      (stage === 'TEST_1_DUEL' && test1Phase !== 'IDLE') ||
      (stage === 'TEST_2_STRESS' && test2Phase !== 'IDLE') ||
      (stage === 'TEST_3_UNCERTAINTY' && test3Phase !== 'IDLE');

    const isResultScreen = stage === 'RESULT_1' || stage === 'RESULT_2' || stage === 'RESULT_3';
    const locked = isTestOngoing || isResultScreen;

    const activeTest = stage === 'TEST_1_DUEL' || stage === 'RESULT_1' ? 'TEST_1_DUEL'
      : stage === 'TEST_2_STRESS' || stage === 'RESULT_2' ? 'TEST_2_STRESS'
        : 'TEST_3_UNCERTAINTY';

    const getBtnClass = (btnStage: string) => {
      const isActive = activeTest === btnStage;
      const isDone = completedTests.has(btnStage);
      const isDisabled = locked || isDone;
      return `flex-1 max-w-[280px] py-1 font-mono text-sm font-bold uppercase rounded-sm border-2 transition-all ${isActive ? 'bg-black text-white border-black'
        : isDone ? 'bg-green-50 text-green-600 border-green-300'
          : 'bg-white text-gray-500 border-gray-300'
        } ${isDisabled && !isActive ? 'cursor-not-allowed' : !isActive ? 'hover:border-black hover:text-black cursor-pointer' : ''
        }`;
    };

    const canClick = (btnStage: string) => !locked && !completedTests.has(btnStage);

    return (
      <div className="bg-gray-100 border-b-2 border-black flex justify-center gap-3 px-6 py-1 relative z-40">
        <button
          onClick={() => canClick('TEST_1_DUEL') && switchTest('TEST_1_DUEL')}
          disabled={!canClick('TEST_1_DUEL')}
          className={getBtnClass('TEST_1_DUEL')}
        >
          {completedTests.has('TEST_1_DUEL') ? '✓' : '⚡'} 1. Rapidité
        </button>
        <button
          onClick={() => canClick('TEST_2_STRESS') && switchTest('TEST_2_STRESS')}
          disabled={!canClick('TEST_2_STRESS')}
          className={getBtnClass('TEST_2_STRESS')}
        >
          {completedTests.has('TEST_2_STRESS') ? '✓' : '🔲'} 2. Pixélisation
        </button>
        <button
          onClick={() => canClick('TEST_3_UNCERTAINTY') && switchTest('TEST_3_UNCERTAINTY')}
          disabled={!canClick('TEST_3_UNCERTAINTY')}
          className={getBtnClass('TEST_3_UNCERTAINTY')}
        >
          {completedTests.has('TEST_3_UNCERTAINTY') ? '❓' : '❓'} 3. Faux Amis
        </button>
      </div>
    );
  };

  // SCREENS

  if (stage === 'WELCOME') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 text-center relative overflow-hidden">
        <div className="absolute top-10 left-10 opacity-10 pointer-events-none -rotate-12 hidden md:block">
          <Eye size={120} />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none rotate-12 hidden md:block">
          <Cat size={120} />
        </div>
        <div className="max-w-2xl w-full bg-white border-4 border-black shadow-retro-lg p-6 md:p-10 rounded-lg animate-fade-in relative z-10">
          <div className="space-y-4 md:space-y-6">
            <div className="inline-block p-3 md:p-4 rounded-full border-2 border-black bg-app-bg shadow-retro-sm mb-2 md:mb-4">
              <Swords size={48} className="md:hidden text-brand-dark" />
              <Swords size={64} className="hidden md:block text-brand-dark" />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-brand-dark uppercase">
              Vision-Duel
            </h1>
            <div className="h-1 w-24 bg-black mx-auto"></div>
            <p className="text-base md:text-xl text-gray-600 font-mono">Bureau d'Analyse IA</p>
            <p className="text-sm md:text-lg text-gray-500 font-medium">
              Tu vas tester deux IA sur la même tâche : reconnaître un chat.<br />
              Trois épreuves. Un verdict.
            </p>
          </div>
          <div className="mt-6 md:mt-12 space-y-3 md:space-y-4">
            <Button onClick={() => setStage('BRIEFING')} className="text-base md:text-xl px-8 md:px-12 py-3 md:py-4 w-full max-w-sm mx-auto">
              Démarrer l'inspection
            </Button>
            <button onClick={() => setStage('BONUS_MENU')} className="block mx-auto text-sm text-gray-400 hover:text-gray-700 font-mono underline transition-colors">
              Aller directement aux bonus
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'LAB_TRAINER') {
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
            <Button variant="secondary" onClick={() => setStage('BONUS_MENU')} className="text-sm md:text-base px-4 py-2">
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
                        <img src={image.url} alt={image.id} className="w-full h-full object-cover" />

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
  }

  if (stage === 'BRIEFING') {
    return (
      <div className="min-h-screen flex flex-col">
        <StageProgress currentStage={0} totalStages={3} title="Briefing" />

        {/* Briefing + Objectif */}
        <div className="bg-white border-b-4 border-black p-3 md:p-5">
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brand-dark border-2 border-black flex items-center justify-center flex-shrink-0 rounded">
                <BookOpen size={16} className="text-white" />
              </div>
              <div>
                <p className="font-black text-sm uppercase text-gray-800 mb-1">Briefing</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Teste <strong>deux IA</strong> qui reconnaissent les chats. Entraînées différemment, elles réagissent différemment.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-300 border-2 border-black flex items-center justify-center flex-shrink-0 rounded">
                <Sparkles size={16} className="text-black" />
              </div>
              <div>
                <p className="font-black text-sm uppercase text-gray-800 mb-1">Objectif</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  À la fin, tu décides <strong>laquelle est la plus fiable</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Candidats A vs B */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 p-4 md:p-8 max-w-6xl mx-auto w-full">

          {/* IA A Card */}
          <div className="flex-1 w-full md:w-auto bg-white p-4 md:p-8 rounded-lg shadow-retro border-2 border-black flex flex-col items-center text-center space-y-3 md:space-y-4 animate-slide-up relative" style={{ animationDelay: '0.1s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-blue border-2 border-black px-3 md:px-4 py-1 text-white font-mono font-bold uppercase text-xs md:text-sm">Candidat A</div>
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${MODEL_A.color} border-2 border-black flex items-center justify-center text-3xl md:text-4xl font-black text-white mb-2 md:mb-4 shadow-retro-sm`}>{MODEL_A.avatar}</div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{MODEL_A.name}</h2>
            <div className="group relative">
              <div className="px-3 py-1 bg-blue-100 text-blue-900 border border-black rounded font-mono text-xs font-bold uppercase cursor-help">{MODEL_A.type}</div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-xs font-mono px-3 py-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Très bon sur images standard
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium text-sm">Performante sur images nettes et standard.</p>
            <button onClick={() => setShowTrainingA(!showTrainingA)} className="text-xs font-mono text-blue-500 hover:text-blue-800 underline flex items-center gap-1 transition-colors">
              <Eye size={12} /> {showTrainingA ? 'Masquer' : 'Voir entraînement'}
            </button>
            {showTrainingA && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 w-full animate-fade-in">
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {trainingSamplesA.map((s, i) => (
                    <div key={i} className="relative">
                      <img src={s.url} alt="Training" className="w-full h-14 object-cover rounded border border-blue-300" />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-1 rounded">Images nettes, bien cadrées</p>
                <p className="text-[9px] text-gray-500 mt-1 italic">Ça influence la fiabilité.</p>
              </div>
            )}
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-gray-300 font-black text-4xl italic">VS</div>
            <p className="text-xs font-mono text-gray-400 text-center max-w-[120px]">Même tâche.<br />Entraînement différent.</p>
          </div>

          {/* IA B Card */}
          <div className="flex-1 w-full md:w-auto bg-white p-4 md:p-8 rounded-lg shadow-retro border-2 border-black flex flex-col items-center text-center space-y-3 md:space-y-4 animate-slide-up relative" style={{ animationDelay: '0.2s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-orange border-2 border-black px-3 md:px-4 py-1 text-white font-mono font-bold uppercase text-xs md:text-sm">Candidat B</div>
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full ${MODEL_B.color} border-2 border-black flex items-center justify-center text-3xl md:text-4xl font-black text-white mb-2 md:mb-4 shadow-retro-sm`}>{MODEL_B.avatar}</div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">{MODEL_B.name}</h2>
            <div className="group relative">
              <div className="px-3 py-1 bg-orange-100 text-orange-900 border border-black rounded font-mono text-xs font-bold uppercase cursor-help">{MODEL_B.type}</div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-white text-xs font-mono px-3 py-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Tient mieux quand ça change
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed font-medium text-sm">Résiste aux variations, admet le doute.</p>
            <button onClick={() => setShowTrainingB(!showTrainingB)} className="text-xs font-mono text-orange-500 hover:text-orange-800 underline flex items-center gap-1 transition-colors">
              <Eye size={12} /> {showTrainingB ? 'Masquer' : 'Voir entraînement'}
            </button>
            {showTrainingB && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 w-full animate-fade-in">
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {trainingSamplesB.map((s, i) => (
                    <div key={i} className="relative">
                      <img src={s.url} alt="Training" className="w-full h-14 object-cover rounded border border-orange-300" />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] font-mono text-orange-700 bg-orange-100 px-2 py-1 rounded">Variations (lumière, recadrage) + cas difficiles</p>
                <p className="text-[9px] text-gray-500 mt-1 italic">Ça influence la fiabilité.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-8 flex flex-col sm:flex-row justify-center items-center gap-3 bg-white border-t-4 border-black">
          <Button
            variant="secondary"
            onClick={() => setStage('WELCOME')}
            className="w-full sm:w-auto text-base md:text-lg"
          >
            Retour au menu principal
          </Button>
          <Button onClick={() => { setStage('TEST_1_DUEL'); setHasAnswered(false); setPredA(undefined); setPredB(undefined); }} className="w-full max-w-md text-base md:text-lg">
            Je commence les tests <ArrowRight className="inline ml-2" size={20} />
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'TEST_1_DUEL') {
    const currentImg = test1Images[test1Index];
    return (
      <div className="min-h-screen flex flex-col">
        {renderTopNav()}
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
                  <img src={currentImg.url} alt="Test" className={`w-full h-full object-cover transition-opacity duration-300 ${(test1Phase === 'FLASHING' || test1Phase === 'REVEALED') ? 'opacity-100' : 'opacity-0'}`} key={test1Index} />
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
  }

  if (stage === 'RESULT_1') {
    return (
      <div className="min-h-screen flex flex-col relative">
        {renderTopNav()}
        <div className="flex-1 flex flex-col justify-center items-center p-8">
          <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
          <div className="max-w-5xl w-full bg-white rounded-lg border-2 md:border-4 border-black shadow-retro-lg p-4 md:p-8 text-center space-y-4 md:space-y-6 animate-fade-in z-10">
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight">Ce que tu viens de tester</h2>

            <div className="grid grid-cols-3 gap-2 md:gap-8 py-2 md:py-8 border-t-2 border-b-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="text-xl md:text-4xl font-black text-brand-dark mb-1 md:mb-2">{test1Scores.humanCorrect}/{test1Scores.humanTotal}</div>
                <div className="text-gray-500 font-mono text-[9px] md:text-sm uppercase">Score humain</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-5xl font-black text-brand-blue mb-1 md:mb-2">{test1Scores.modelACorrect}/{test1Scores.modelATotal}</div>
                <div className="text-gray-500 font-mono text-[9px] md:text-sm uppercase">Score IA A</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-5xl font-black text-brand-orange mb-1 md:mb-2">{test1Scores.modelBCorrect}/{test1Scores.modelBTotal}</div>
                <div className="text-gray-500 font-mono text-[9px] md:text-sm uppercase">Score IA B</div>
              </div>
            </div>

            <div className="text-left space-y-4 max-w-5xl mx-auto bg-gray-50 p-4 rounded-lg border-2 border-black">
              <p className="text-sm text-gray-800 leading-snug">
                <strong className="text-brand-dark uppercase bg-brand-dark/10 px-2 py-1 rounded text-xs">Mode flash</strong><br />
                L'image apparaît brièvement. Ton cerveau décide avec peu d'infos : formes incomplètes, détails manquants. D'où les erreurs.
              </p>
              <p className="text-sm text-gray-800 leading-snug">
                <strong className="text-brand-dark uppercase bg-brand-dark/10 px-2 py-1 rounded text-xs">Comment l'IA répond</strong><br />
                L'IA ne réfléchit pas. Elle calcule des scores "chat" et "pas chat" appris par entraînement. Le plus élevé gagne. La confiance n'est pas une garantie.
              </p>
              <p className="text-sm text-gray-800 leading-snug">
                <strong className="text-brand-dark uppercase bg-brand-dark/10 px-2 py-1 rounded text-xs">À retenir</strong><br />
                Réussir sur images rapides = le modèle fonctionne si l'info est claire. La vraie question : que se passe-t-il si on pixélise ?
              </p>
            </div>

            <Button onClick={() => { switchTest('TEST_2_STRESS') }} className="w-full max-w-sm mx-auto text-xl py-4 mt-8">
              Passer à la Pixélisation <ArrowRight className="inline ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'TEST_2_STRESS') {
    const currentImg = test2Images[test2Index];
    const level = test2Index < 2 ? 'léger' : test2Index < 4 ? 'moyen' : 'fort';

    return (
      <div className="min-h-screen flex flex-col">
        {renderTopNav()}
        <StageProgress currentStage={2} totalStages={3} title="Test 2 : Pixélisation" subtitle={`Image ${test2Index + 1} / ${test2Images.length} — Difficulté: ${level}`} />
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
                        <div className="text-white font-mono animate-pulse uppercase tracking-widest text-sm">Génération de l'image pixélisée...</div>
                      ) : test2Phase === 'TRUTH_REVEAL' && currentImg ? (
                        <img src={currentImg.url} alt="Original" className="w-full h-full object-cover animate-fade-in" />
                      ) : pixelatedImageB64 ? (
                        <img src={`data:image/jpeg;base64,${pixelatedImageB64}`} alt="Pixelated" className="w-full h-full object-cover animate-fade-in" style={{ imageRendering: 'pixelated' }} />
                      ) : null}
                    </div>
                    <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded border border-white/20 text-xs font-mono uppercase tracking-widest z-20">
                      Niveau : {level}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="h-16 md:h-20 flex flex-col justify-center">
              {test2Phase === 'IDLE' ? (
                <Button onClick={() => setTest2Phase('LOADING')} className="w-full h-14 md:h-20 text-base md:text-xl font-bold">Lancer le duel</Button>
              ) : test2Phase === 'PIXELATED_VIEW' && (
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
  }

  if (stage === 'RESULT_2') {
    return (
      <div className="min-h-screen flex flex-col relative">
        {renderTopNav()}
        <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8">
          <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
          <div className="max-w-5xl w-full bg-white rounded-lg border-2 md:border-4 border-black shadow-retro-lg p-4 md:p-8 text-center space-y-4 md:space-y-6 animate-fade-in z-10">
            <h2 className="text-xl md:text-4xl font-black uppercase tracking-tight">Ce que montre la pixélisation</h2>

            <div className="grid grid-cols-3 gap-2 md:gap-8 py-2 md:py-8 border-t-2 border-b-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="text-xl md:text-5xl font-black text-brand-dark mb-1 md:mb-2">{test2Scores.humanCorrect}/{test2Scores.humanTotal}</div>
                <div className="text-gray-500 font-mono text-[9px] md:text-sm uppercase">Score humain</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-5xl font-black text-brand-blue mb-1 md:mb-2">{test2Scores.modelACorrect}/{test2Scores.modelATotal}</div>
                <div className="text-gray-500 font-mono text-[9px] md:text-sm uppercase">Score IA A</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-5xl font-black text-brand-orange mb-1 md:mb-2">{test2Scores.modelBCorrect}/{test2Scores.modelBTotal}</div>
                <div className="text-gray-500 font-mono text-[9px] md:text-sm uppercase">Score IA B</div>
              </div>
            </div>
            <div className="text-xs md:text-sm font-mono text-gray-500 uppercase pb-2 md:pb-4">Niveaux de pixélisation utilisés : Léger, Moyen, Fort</div>

            <div className="text-left space-y-6 max-w-5xl mx-auto bg-gray-50 p-6 rounded-lg border-2 border-black">
              <p className="text-base text-gray-800 leading-relaxed">
                Quand on pixélise une image, on supprime une partie de l'information : les détails fins disparaissent et il ne reste que des formes grossières. Dans cette étape, toi et les IA avez pris une décision sur <strong className="bg-yellow-200 px-1">exactement la même image dégradée</strong>.
              </p>
              <p className="text-base text-gray-800 leading-relaxed">
                Ce test montre une limite simple mais importante : un modèle peut être très bon quand l'image est "propre", puis perdre en fiabilité dès qu'on réduit la qualité. La différence vient souvent de ce que le modèle a apprit à utiliser : des détails fragiles (textures, petits motifs) ou des indices plus robustes (formes générales).
              </p>
              <p className="text-base text-gray-800 leading-relaxed font-bold bg-brand-dark/10 p-4 rounded border-l-4 border-brand-dark">
                Ce qu’il faut retenir  : pour juger une IA, il ne suffit pas de regarder si elle réussit sur des images parfaites. Il faut vérifier comment elle se comporte quand l'information se dégrade, car c'est ce qui arrive souvent en conditions réelles.
              </p>
            </div>

            <Button onClick={() => { switchTest('TEST_3_UNCERTAINTY'); }} className="w-full max-w-sm mx-auto text-xl py-4 mt-8">
              Dernier test : Faux Amis <ArrowRight className="inline ml-2" />
            </Button>
            <p className="text-sm text-gray-500 font-mono pt-2">Étape suivante : on va tester des cas où l'image ressemble à un chat... sans être un chat.</p>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'TEST_3_UNCERTAINTY') {
    const currentImg = test3Images[test3Index];
    return (
      <div className="min-h-screen flex flex-col">
        {renderTopNav()}
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
                    {currentImg && <img src={currentImg.url} alt="Uncertainty Test" className="w-full h-full object-cover" key={test3Index} />}
                  </>
                )}
              </div>
            </div>

            {test3Phase === 'IDLE' ? (
              <Button onClick={() => setTest3Phase('STARTED')} className="w-full h-14 md:h-20 text-base md:text-xl font-bold">Lancer le duel</Button>
            ) : !hasAnswered ? (
              <div className="grid grid-cols-3 gap-2 md:gap-4" style={{ position: 'relative', zIndex: 10 }}>
                <Button onClick={() => handleTest3Answer('PAS_CHAT')} disabled={isAnalyzing} variant="secondary" className="text-sm md:text-lg h-14 md:h-16">PAS CHAT</Button>
                <Button onClick={() => handleTest3Answer('IDK')} disabled={isAnalyzing} className="bg-brand-dark text-white hover:bg-black border-2 border-black text-sm md:text-lg h-14 md:h-16">JE NE SAIS PAS</Button>
                <Button onClick={() => handleTest3Answer('CHAT')} disabled={isAnalyzing} className="text-sm md:text-lg h-14 md:h-16">CHAT</Button>
              </div>
            ) : (
              <div className="flex justify-center" style={{ position: 'relative', zIndex: 10 }}>
                <Button onClick={goToNextTest3} className="px-8 md:px-12 py-3 md:py-4 text-base md:text-lg">
                  {test3Index < test3Images.length - 1 ? 'Suivant' : 'Voir les resultats'} <ArrowRight className="inline ml-2" size={20} />
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1"><AICard model={MODEL_A} prediction={predA} loading={isAnalyzing} showUncertainty={true} /></div>
            <div className="flex-1"><AICard model={MODEL_B} prediction={predB} loading={isAnalyzing} showUncertainty={true} /></div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'RESULT_3') {
    return (
      <div className="min-h-screen flex flex-col relative">
        {renderTopNav()}
        <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8">
          <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
          <div className="max-w-6xl w-full bg-white rounded-lg border-2 md:border-4 border-black shadow-retro-lg p-4 md:p-6 text-center space-y-3 md:space-y-4 animate-fade-in z-10">
            <h2 className="text-lg md:text-2xl font-black uppercase tracking-tight">Ce que montrent les "faux amis"</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 py-3 md:py-4 border-t-2 border-b-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-black text-brand-dark mb-2">{test3Scores.humanCorrect}/{test3Scores.humanTotal}</div>
                <div className="text-gray-500 font-mono text-xs md:text-sm uppercase">Score humain</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-black text-brand-blue mb-2">{test3Scores.modelACorrect}/{test3Scores.modelATotal}</div>
                <div className="text-gray-500 font-mono text-xs md:text-sm uppercase">Score IA A</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-black text-brand-orange mb-2">{test3Scores.modelBCorrect}/{test3Scores.modelBTotal}</div>
                <div className="text-gray-500 font-mono text-xs md:text-sm uppercase">Score IA B</div>
              </div>
            </div>

            <div className="text-left space-y-3 max-w-full mx-auto bg-gray-50 p-4 rounded-lg border-2 border-black">
              <p className="text-sm text-gray-800 leading-snug">
                Ces images étaient <strong className="bg-yellow-200 px-1">ambiguës</strong> : elles ressemblent à un chat sans en être un. Test de généralisation.
              </p>
              <p className="text-sm text-gray-800 leading-snug">
                Un modèle n'a pas la notion abstraite de "chat". Il apprend des <strong>motifs visuels</strong>. Sur des cas proches mais différents, il peut se tromper avec confiance.
              </p>
              <p className="text-sm text-gray-800 leading-snug font-bold bg-brand-dark/10 p-3 rounded border-l-4 border-brand-dark">
                À retenir : la performance dépend de l'entraînement. Teste les cas limites et gère l'incertitude.
              </p>
            </div>

            <Button onClick={() => setStage('CONCLUSION')} className="w-full max-w-sm mx-auto">
              Voir la conclusion <ArrowRight className="inline ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'CONCLUSION') {
    const scoreA_T1 = pct(test1Scores.modelACorrect, test1Scores.modelATotal);
    const scoreB_T1 = pct(test1Scores.modelBCorrect, test1Scores.modelBTotal);
    const scoreA_T2 = pct(test2Scores.modelACorrect, test2Scores.modelATotal);
    const scoreB_T2 = pct(test2Scores.modelBCorrect, test2Scores.modelBTotal);
    const scoreA_T3 = pct(test3Scores.modelACorrect, test3Scores.modelATotal);
    const scoreB_T3 = pct(test3Scores.modelBCorrect, test3Scores.modelBTotal);

    const resetAll = () => {
      setStage('WELCOME');
      setTest1Index(0); setTest2Index(0); setTest3Index(0);
      setPredA(undefined); setPredB(undefined);
      setHasAnswered(false); setIsAnalyzing(false);
      setTest1Phase('IDLE'); setTest2Phase('IDLE'); setTest3Phase('IDLE'); setCompletedTests(new Set());
      setTest2HasAnswered(false); setPixelatedImageB64(null);
      setTest1Scores({ humanCorrect: 0, humanTotal: 0, modelACorrect: 0, modelATotal: 0, modelBCorrect: 0, modelBTotal: 0 });
      setTest2Scores({ humanCorrect: 0, humanTotal: 0, modelACorrect: 0, modelATotal: 0, modelBCorrect: 0, modelBTotal: 0 });
      setTest3Scores({ humanCorrect: 0, humanTotal: 0, modelACorrect: 0, modelATotal: 0, modelBCorrect: 0, modelBTotal: 0 });
      setTest3IdkCount(0); setTest3FooledImages([]);
    };

    return (
      <div className="min-h-screen flex flex-col relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
        <div className="absolute top-10 left-10 opacity-10 pointer-events-none -rotate-12 z-0 hidden md:block"><Eye size={120} /></div>
        <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none rotate-12 z-0 hidden md:block"><ShieldCheck size={120} /></div>
        <div className="flex-1 flex flex-col items-center justify-center p-3 md:p-6 z-10">
          <div className="w-full max-w-[90rem] bg-white rounded-lg border-2 md:border-4 border-black shadow-retro-lg p-3 md:p-5 space-y-2 md:space-y-3">

            {/* Header */}
            <div className="text-center bg-brand-dark rounded-lg p-3 md:p-4 border-2 border-black">
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-1 text-white">🏁 Conclusion</h2>
              <p className="font-mono text-gray-300 text-xs md:text-sm">Résumé de l'activité — Chat / Pas Chat</p>
            </div>

            {/* Stats résumé */}
            <div className="bg-gray-50 border-2 border-black rounded-lg p-3 md:p-4 shadow-retro-sm">
              <table className="w-full text-xs md:text-sm font-mono">
                <thead>
                  <tr className="border-b-2 border-black bg-gray-100">
                    <th className="text-left py-2 px-3 text-gray-500 uppercase text-xs rounded-tl">Test</th>
                    <th className="text-center py-2 text-brand-blue uppercase text-xs">IA A</th>
                    <th className="text-center py-2 text-brand-orange uppercase text-xs rounded-tr">IA B</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 bg-blue-50/40">
                    <td className="py-2 px-3">⚡ Rapidité</td>
                    <td className="text-center font-bold text-brand-blue">{scoreA_T1}%</td>
                    <td className="text-center font-bold text-brand-orange">{scoreB_T1}%</td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-orange-50/40">
                    <td className="py-2 px-3">🔲 Pixélisation</td>
                    <td className="text-center font-bold text-brand-blue">{scoreA_T2}%</td>
                    <td className="text-center font-bold text-brand-orange">{scoreB_T2}%</td>
                  </tr>
                  <tr className="bg-purple-50/40">
                    <td className="py-2 px-3">❓ Faux Amis</td>
                    <td className="text-center font-bold text-brand-blue">{scoreA_T3}%</td>
                    <td className="text-center font-bold text-brand-orange">{scoreB_T3}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Conclusion text */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-3 shadow-retro-sm space-y-2">
              <p className="text-sm text-gray-800 leading-snug">
                Tu as testé <strong className="bg-yellow-200 px-1">"chat / pas chat"</strong> avec deux IA. Résultat : une IA n'a pas d'intelligence générale. Elle apprend sur des exemples et calcule des scores. Si les images ressemblent à l'entraînement, elle est performante. Sinon (flash, pixélisation, faux amis), ses erreurs diffèrent de l'humain.
              </p>
              <p className="text-sm text-gray-800 leading-snug font-bold bg-brand-dark/10 p-3 rounded border-l-4 border-brand-dark">
                La qualité dépend des données et conditions d'usage. Un bon modèle reste <strong>stable</strong> quand la qualité baisse et gère les cas ambigus.
              </p>
            </div>

            {/* 3 Règles à emporter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 shadow-retro-sm hover:shadow-retro hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 bg-brand-blue text-white border-2 border-black flex items-center justify-center font-black text-sm mb-3 rounded">1</div>
                <h4 className="font-black text-sm uppercase mb-2 text-blue-900">Pas "intelligente en général"</h4>
                <p className="text-xs text-blue-800 font-mono leading-snug">Bonne sur des situations proches de l'entraînement.</p>
              </div>
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 shadow-retro-sm hover:shadow-retro hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 bg-brand-orange text-white border-2 border-black flex items-center justify-center font-black text-sm mb-3 rounded">2</div>
                <h4 className="font-black text-sm uppercase mb-2 text-orange-900">La fiabilité se teste</h4>
                <p className="text-xs text-orange-800 font-mono leading-snug">Teste quand l'info baisse (flash, pixélisation, faux amis), pas que sur images faciles.</p>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 shadow-retro-sm hover:shadow-retro hover:-translate-y-0.5 transition-all">
                <div className="w-8 h-8 bg-yellow-400 text-black border-2 border-black flex items-center justify-center font-black text-sm mb-3 rounded">3</div>
                <h4 className="font-black text-sm uppercase mb-2 text-yellow-900">Confiance ≠ vérité</h4>
                <p className="text-xs text-yellow-800 font-mono leading-snug">L'IA peut être sûre et se tromper. Gère l'incertitude : vérifie, abstiens-toi, teste.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 pt-2">
              <button onClick={() => setStage('BONUS_MENU')} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 md:py-3 md:px-8 border-2 border-black shadow-retro active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-xs md:text-sm flex items-center justify-center gap-2">
                <Brain size={16} className="md:hidden" />
                <Brain size={18} className="hidden md:block" />Petit plus pour les curieux
              </button>
              <button onClick={resetAll} className="bg-brand-dark hover:bg-gray-800 text-white font-bold py-2 px-4 md:py-3 md:px-8 border-2 border-black shadow-retro active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-xs md:text-sm flex items-center justify-center gap-2">
                <RefreshCw size={16} className="md:hidden" />
                <RefreshCw size={18} className="hidden md:block" />Recommencer
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // BONUS SCREENS
  // ============================================================

  if (stage === 'BONUS_MENU') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
        <div className="max-w-3xl w-full bg-white rounded-lg border-2 md:border-4 border-black shadow-retro-lg p-6 md:p-10 text-center space-y-4 md:space-y-8 animate-fade-in z-10">
          <div className="inline-flex items-center justify-center p-3 md:p-4 bg-purple-100 border-2 border-black rounded-full text-purple-700 mb-2 md:mb-4 shadow-retro-sm">
            <Brain size={36} className="md:hidden" />
            <Brain size={48} className="hidden md:block" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Petit plus pour les curieux</h2>
          <p className="text-sm md:text-base text-gray-600 font-medium">Activités bonus pour aller plus loin.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <button
              onClick={() => setStage('BONUS_A1')}
              className="bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-400 p-4 md:p-6 rounded-lg text-left transition-all hover:shadow-retro-sm group"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <Sparkles size={24} className="md:hidden text-indigo-600" />
                <Sparkles size={28} className="hidden md:block text-indigo-600" />
                <h3 className="font-black text-base md:text-lg uppercase text-indigo-900">Bonus A</h3>
              </div>
              <p className="font-bold text-sm md:text-base text-indigo-800 mb-1 md:mb-2">Dans la tête du modele</p>
              <p className="text-xs md:text-sm text-indigo-600 font-mono">Comment le modèle apprend-il ? 3 écrans, 30 secondes.</p>
            </button>

            <button
              onClick={() => setStage('BONUS_B')}
              className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-400 p-4 md:p-6 rounded-lg text-left transition-all hover:shadow-retro-sm group"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <BookOpen size={24} className="md:hidden text-amber-600" />
                <BookOpen size={28} className="hidden md:block text-amber-600" />
                <h3 className="font-black text-base md:text-lg uppercase text-amber-900">Bonus B</h3>
              </div>
              <p className="font-bold text-sm md:text-base text-amber-800 mb-1 md:mb-2">Surapprentissage en 30 secondes</p>
              <p className="text-xs md:text-sm text-amber-600 font-mono">Apprendre parfaitement... ne veut pas dire généraliser.</p>
            </button>

            <button
              onClick={() => { setBonusCFailure(null); setBonusCDiagnosis(null); setBonusCKit(null); setStage('BONUS_C_INTRO'); }}
              className="bg-green-50 hover:bg-green-100 border-2 border-green-400 p-4 md:p-6 rounded-lg text-left transition-all hover:shadow-retro-sm group"
            >
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <Wrench size={24} className="md:hidden text-green-600" />
                <Wrench size={28} className="hidden md:block text-green-600" />
                <h3 className="font-black text-base md:text-lg uppercase text-green-900">Bonus C</h3>
              </div>
              <p className="font-bold text-sm md:text-base text-green-800 mb-1 md:mb-2">Atelier de Réparation</p>
              <p className="text-xs md:text-sm text-green-600 font-mono">Diagnostiquez une panne IA et réparez-la avec de meilleures données.</p>
            </button>

            <button
              onClick={() => setStage('LAB_TRAINER')}
              className="relative overflow-hidden bg-cyan-50 hover:bg-cyan-100 border-2 border-cyan-400 p-4 md:p-6 rounded-lg text-left transition-all hover:shadow-retro-sm group"
            >
              <span className="absolute top-2 right-2 bg-indigo-900 text-white border border-indigo-200 rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wide">
                Special
              </span>
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <Brain size={24} className="md:hidden text-cyan-700" />
                <Brain size={28} className="hidden md:block text-cyan-700" />
                <h3 className="font-black text-base md:text-lg uppercase text-cyan-900">Bonus D</h3>
              </div>
              <p className="font-bold text-sm md:text-base text-cyan-800 mb-1 md:mb-2">Entraîne ton IA</p>
              <p className="text-xs md:text-sm text-cyan-700 font-mono">4 images fixes au lancement, avec pourcentages IA visibles directement.</p>
            </button>
          </div>

          <div className="text-center pt-6">
            <button onClick={() => setStage('CONCLUSION')} className="text-gray-500 hover:text-gray-800 font-mono text-sm underline">
              Retour à la conclusion
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Helper for Bonus C ---
  const getBonusCImages = () => {
    // Find suitable candidates
    const chatImages = allImages.filter(img => img.truth === 'CHAT');
    const pasChatImages = allImages.filter(img => img.truth === 'PAS_CHAT');

    // 1. Dark: A clear chat image to darken
    const darkCandidate = chatImages[0];
    // 2. Crop: Another chat image
    const cropCandidate = chatImages[1] || chatImages[0];
    // 3. Faux Ami: A 'pas chat' image that might look like a cat (or just any pas chat)
    const fauxAmiCandidate = pasChatImages[0];

    return { dark: darkCandidate, crop: cropCandidate, fauxAmi: fauxAmiCandidate };
  };

  // --- Bonus A: Screen 1 — Before learning ---
  if (stage === 'BONUS_A1') {
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
              {sampleImg && <img src={sampleImg.url} alt="Before" className="w-full h-full object-cover opacity-70" />}
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
            <Button onClick={() => setStage('BONUS_A2')}>
              Suivant <ArrowRight className="inline ml-2" size={18} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Bonus A: Screen 2 — During learning (animated loss curve) ---
  if (stage === 'BONUS_A2') {
    return <BonusA2Screen onNext={() => setStage('BONUS_A3')} />;
  }

  // --- Bonus A: Screen 3 — After learning ---
  if (stage === 'BONUS_A3') {
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
              {sampleImg && <img src={sampleImg.url} alt="After" className="w-full h-full object-cover" />}
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
            <button onClick={() => setStage('BONUS_MENU')} className="text-gray-500 hover:text-black font-mono text-sm underline uppercase">Retour au menu bonus</button>
            <Button onClick={() => setStage('CONCLUSION')}>
              Retour à la conclusion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Bonus B: Overfitting comparison ---
  if (stage === 'BONUS_B') {
    const metrics = TRAINING_METRICS;
    // Model A (clean only): high train, lower on mixed test → overfitting
    const aTrainFinal = metrics.modelA_train_acc[9];
    const aValFinal = metrics.modelA_val_acc[9];
    // Model B (clean+mixed): slightly lower train, better generalization
    const bTrainFinal = metrics.modelB_train_acc[9];
    const bValFinal = metrics.modelB_val_acc[9];

    const BarChart = ({ label, trainScore, testScore, trainColor, testColor, tagline }: {
      label: string; trainScore: number; testScore: number;
      trainColor: string; testColor: string; tagline: string;
    }) => (
      <div className="space-y-4">
        <h4 className="font-black uppercase text-center text-lg">{label}</h4>
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span>Score entraînement</span>
            <span className="font-bold">{trainScore.toFixed(1)}%</span>
          </div>
          <div className="h-6 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
            <div className={`h-full ${trainColor} rounded-full animate-fill`} style={{ width: `${trainScore}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span>Score test (nouveau)</span>
            <span className={`font-bold ${testScore < 80 ? 'text-red-600' : 'text-green-700'}`}>{testScore.toFixed(1)}%</span>
          </div>
          <div className="h-6 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
            <div className={`h-full ${testColor} rounded-full animate-fill`} style={{ width: `${testScore}%` }}></div>
          </div>
        </div>
        <p className="text-xs text-gray-500 font-mono italic text-center">{tagline}</p>
      </div>
    );

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
        <div className="max-w-4xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-10 space-y-8 animate-fade-in z-10">
          <div className="text-center">
            <span className="bg-amber-100 text-amber-700 px-4 py-1 rounded-full border border-amber-300 font-mono text-xs font-bold uppercase">Bonus B</span>
            <h2 className="text-3xl font-black uppercase tracking-tight mt-4">Surapprentissage en 30 secondes</h2>
            <p className="text-gray-500 font-mono text-sm mt-2">Apprendre parfaitement ≠ généraliser</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
              <BarChart
                label="Entrainement 'trop propre'"
                trainScore={aTrainFinal}
                testScore={aValFinal}
                trainColor="bg-red-400"
                testColor="bg-red-300"
                tagline="Parfait sur ce qu'il a vu"
              />
            </div>
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
              <BarChart
                label="Entraînement 'varié'"
                trainScore={bTrainFinal}
                testScore={bValFinal}
                trainColor="bg-green-400"
                testColor="bg-green-500"
                tagline="Plus fiable sur du nouveau"
              />
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-4 text-center">
            <p className="font-mono text-sm text-amber-900 font-bold">
              "Le modèle qui a l'air parfait peut être celui qui se casse le plus dans le réel."
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={() => setStage('BONUS_MENU')} className="text-gray-500 hover:text-black font-mono text-sm underline uppercase">Retour au menu bonus</button>
            <Button onClick={() => setStage('CONCLUSION')}>
              Retour à la conclusion
            </Button>
          </div>
        </div>
      </div>
    );
  }


  // --- Bonus C: Atelier de Reparation ---

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
            <Button onClick={() => setStage('BONUS_MENU')} variant="secondary">Retour</Button>
            <Button onClick={() => setStage('BONUS_C_SELECTION')}>Commencer <ArrowRight className="inline ml-2" size={18} /></Button>
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
        {/* Fix: Added explicit z-index to ensure visibility */}
        <div className="z-10 w-full max-w-6xl">
          <h2 className="text-3xl font-black uppercase tracking-tight text-center mb-2 bg-white inline-block px-4 py-2 border-2 border-black shadow-retro-sm mx-auto">Choisir une panne</h2>
          <p className="text-center font-mono text-gray-600 mb-8 bg-white/80 inline-block px-2">Identifiez un cas ou le modèle A échoue.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cases.map((c) => (
              <div key={c.id} className="bg-white border-4 border-black shadow-retro rounded-lg overflow-hidden flex flex-col">
                <div className="h-48 bg-gray-100 relative border-b-2 border-black overflow-hidden group">
                  {c.img && <img src={c.img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ filter: c.filter }} />}
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

                  <Button onClick={() => { setBonusCFailure(c.id as any); setStage('BONUS_C_DIAGNOSE'); }} className="w-full text-sm py-2">
                    Diagnostiquer
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={() => setStage('BONUS_MENU')} className="text-gray-500 hover:text-black font-mono text-sm underline uppercase bg-white px-2">Retour</button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Diagnose
  if (stage === 'BONUS_C_DIAGNOSE') {
    const candidates = getBonusCImages();
    // Use a default object to avoid null/undefined errors if fetch failed
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
              {currentImg.url && <img src={currentImg.url} className="w-full h-full object-cover" style={{ filter: currentFilter }} />}
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
            <Button onClick={() => setStage('BONUS_C_KIT')} disabled={!bonusCDiagnosis}>
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
            <Button onClick={() => setStage('BONUS_C_RESULT')} disabled={!bonusCKit} className="px-12 py-4 text-xl">
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
    // Use dummy if fetching hasn't happened yet (shouldn't happen here but safe)
    const defaultImg = { url: '', id: 'dummy', truth: 'CHAT', path: '' };
    let currentImg = defaultImg;
    let currentFilter = 'none';
    let success = false;
    let message = "";

    // Logic: did the kit match the failure?
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
                {currentImg.url && <img src={currentImg.url} className="w-full h-full object-cover" style={{ filter: currentFilter }} />}
                <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white font-mono text-xs font-bold py-1">ERREUR</div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight size={40} className={success ? "text-green-500" : "text-gray-300"} />
            </div>

            <div className={`flex-1 text-center transform scale-110 transition-all ${success ? '' : 'opacity-50'}`}>
              <h3 className="font-mono font-bold uppercase mb-2 text-brand-dark">Après</h3>
              <div className={`relative aspect-square bg-gray-100 border-4 ${success ? 'border-green-500' : 'border-red-400'} rounded overflow-hidden mb-2 shadow-lg`}>
                {currentImg.url && <img src={currentImg.url} className="w-full h-full object-cover" style={{ filter: currentFilter }} />}
                <div className={`absolute bottom-0 left-0 right-0 ${success ? 'bg-green-600' : 'bg-red-600'} text-white font-mono text-xs font-bold py-1`}>
                  {success ? (bonusCFailure === 'FAUX_AMI' ? "PAS CHAT (98%)" : "CHAT (95%)") : "ERREUR"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={() => setStage('BONUS_MENU')} variant="secondary">Retour au menu</Button>
            <Button onClick={() => setStage('BONUS_C_SELECTION')}>Réparer une aute panne</Button>
          </div>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen flex items-center justify-center text-2xl font-mono text-red-500">Erreur : etape inconnue</div>;
};

export default App;