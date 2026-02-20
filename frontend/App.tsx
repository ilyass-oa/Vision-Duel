import React, { useState, useEffect, useCallback } from 'react';
import { ScreenStage, StressState, Prediction, ActivityImage, TestScores, StressResult, UncertaintyResult } from './types';
import { MODEL_A, MODEL_B, TEST_1_COUNT, TEST_2_COUNT, TEST_3_COUNT, UNCERTAINTY_THRESHOLD, TRAINING_METRICS } from './constants';
import { fetchAllImages, fetchPredictions, fetchTransformedPredictions } from './api';
import { Button } from './components/Button';
import { AICard } from './components/AICard';
import { StageProgress } from './components/StageProgress';
import { ArrowRight, CheckCircle, AlertTriangle, ShieldCheck, Eye, RefreshCw, Sun, Crop, Aperture, Stamp, Brain, Sparkles, BookOpen, Wrench } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
      <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
      <div className="max-w-3xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-10 space-y-8 animate-fade-in z-10">
        <div className="text-center">
          <span className="bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full border border-indigo-300 font-mono text-xs font-bold uppercase">Bonus A - Écran 2/3</span>
          <h2 className="text-3xl font-black uppercase tracking-tight mt-4">Pendant l'apprentissage</h2>
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

const App: React.FC = () => {
  const [stage, setStage] = useState<ScreenStage>('WELCOME');

  // Images loaded from backend
  const [test1Images, setTest1Images] = useState<ActivityImage[]>([]);
  const [test2Images, setTest2Images] = useState<ActivityImage[]>([]);
  const [test3Images, setTest3Images] = useState<ActivityImage[]>([]);

  // Test 1 state
  const [test1Index, setTest1Index] = useState(0);
  const [predA, setPredA] = useState<Prediction | undefined>();
  const [predB, setPredB] = useState<Prediction | undefined>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [test1Scores, setTest1Scores] = useState<TestScores>({
    humanCorrect: 0, humanTotal: 0,
    modelACorrect: 0, modelATotal: 0,
    modelBCorrect: 0, modelBTotal: 0,
  });

  // Test 2 state
  const [test2Index, setTest2Index] = useState(0);
  const [stressState, setStressState] = useState<StressState>({ blurLevel: 0, darkLevel: 0, cropLevel: 0 });
  const [stressResults, setStressResults] = useState<StressResult>({ modelAStability: [], modelBStability: [] });

  // Test 3 state
  const [test3Index, setTest3Index] = useState(0);
  const [uncertaintyResults, setUncertaintyResults] = useState<UncertaintyResult>({
    modelAOverconfidentErrors: 0, modelBAbstentions: 0,
    modelATotal: 0, modelBTotal: 0,
  });

  // Load images on mount
  // Load images on mount
  const [allImages, setAllImages] = useState<ActivityImage[]>([]);

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
        const t3End = Math.min(t2End + TEST_3_COUNT, n);
        setTest1Images(shuffled.slice(0, t1End));
        setTest2Images(shuffled.slice(t1End, t2End));
        setTest3Images(shuffled.slice(t2End, t3End));
      })
      .catch(err => console.error("Failed to load images:", err));
  }, []);

  // ----- Test 1: DUEL -----
  const handleTest1Answer = async (userAnswer: 'CHAT' | 'PAS_CHAT') => {
    if (hasAnswered || test1Images.length === 0) return;
    setIsAnalyzing(true);
    setHasAnswered(true);

    try {
      const img = test1Images[test1Index];
      const result = await fetchPredictions(img.id);
      const truth = result.truth;

      const pA: Prediction = { label: result.model_a.label, confidence: result.model_a.confidence };
      const pB: Prediction = { label: result.model_b.label, confidence: result.model_b.confidence };
      setPredA(pA);
      setPredB(pB);

      setTest1Scores(prev => ({
        humanCorrect: prev.humanCorrect + (userAnswer === truth ? 1 : 0),
        humanTotal: prev.humanTotal + 1,
        modelACorrect: prev.modelACorrect + (pA.label === truth ? 1 : 0),
        modelATotal: prev.modelATotal + 1,
        modelBCorrect: prev.modelBCorrect + (pB.label === truth ? 1 : 0),
        modelBTotal: prev.modelBTotal + 1,
      }));
    } catch (err) {
      console.error("Prediction error:", err);
    }
    setIsAnalyzing(false);
  };

  const goToNextTest1 = () => {
    if (test1Index < test1Images.length - 1) {
      setTest1Index(prev => prev + 1);
      setPredA(undefined);
      setPredB(undefined);
      setHasAnswered(false);
    } else {
      setStage('RESULT_1');
    }
  };

  // ----- Test 2: STRESS -----
  const fetchStressPredictions = useCallback(async () => {
    if (test2Images.length === 0 || stage !== 'TEST_2_STRESS') return;

    const transforms: string[] = [];
    if (stressState.blurLevel > 0) transforms.push('blur');
    if (stressState.darkLevel > 0) transforms.push('darken');
    if (stressState.cropLevel > 0) transforms.push('crop');

    try {
      const img = test2Images[test2Index];

      if (transforms.length === 0) {
        const result = await fetchPredictions(img.id);
        setPredA({ label: result.model_a.label, confidence: result.model_a.confidence, stability: 'STABLE' });
        setPredB({ label: result.model_b.label, confidence: result.model_b.confidence, stability: 'STABLE' });
      } else {
        const result = await fetchTransformedPredictions(img.id, transforms);
        setPredA({
          label: result.model_a.label,
          confidence: result.model_a.confidence,
          stability: result.model_a.stability as Prediction['stability'],
        });
        setPredB({
          label: result.model_b.label,
          confidence: result.model_b.confidence,
          stability: result.model_b.stability as Prediction['stability'],
        });
      }
    } catch (err) {
      console.error("Transform prediction error:", err);
    }
  }, [stressState, stage, test2Index, test2Images]);

  useEffect(() => {
    if (stage === 'TEST_2_STRESS') {
      fetchStressPredictions();
    }
  }, [fetchStressPredictions, stage]);

  const toggleStress = (type: 'blur' | 'dark' | 'crop') => {
    setStressState(prev => {
      const key = `${type}Level` as keyof StressState;
      return { ...prev, [key]: prev[key] === 0 ? 1 : 0 };
    });
  };

  const goToNextTest2 = () => {
    // Save stability results from current predictions
    setStressResults(prev => ({
      modelAStability: [...prev.modelAStability, predA?.stability || 'STABLE'],
      modelBStability: [...prev.modelBStability, predB?.stability || 'STABLE'],
    }));

    if (test2Index < test2Images.length - 1) {
      setTest2Index(prev => prev + 1);
      setStressState({ blurLevel: 0, darkLevel: 0, cropLevel: 0 });
      setPredA(undefined);
      setPredB(undefined);
    } else {
      setStage('RESULT_2');
    }
  };

  // ----- Test 3: UNCERTAINTY -----
  const handleTest3Answer = async (userAnswer: 'CHAT' | 'PAS_CHAT' | 'IDK') => {
    if (hasAnswered || test3Images.length === 0) return;
    setIsAnalyzing(true);
    setHasAnswered(true);

    try {
      const img = test3Images[test3Index];
      const result = await fetchPredictions(img.id);
      const truth = result.truth;

      // Apply uncertainty threshold: if confidence < threshold, show INCERTAIN
      const labelA = result.model_a.confidence < UNCERTAINTY_THRESHOLD ? 'INCERTAIN' as const : result.model_a.label;
      const labelB = result.model_b.confidence < UNCERTAINTY_THRESHOLD ? 'INCERTAIN' as const : result.model_b.label;

      const pA: Prediction = { label: labelA, confidence: result.model_a.confidence };
      const pB: Prediction = { label: labelB, confidence: result.model_b.confidence };
      setPredA(pA);
      setPredB(pB);

      // Track: A overconfident error (high confidence but wrong), B abstention
      setUncertaintyResults(prev => ({
        modelAOverconfidentErrors: prev.modelAOverconfidentErrors +
          (result.model_a.label !== truth && result.model_a.confidence >= UNCERTAINTY_THRESHOLD ? 1 : 0),
        modelBAbstentions: prev.modelBAbstentions +
          (result.model_b.confidence < UNCERTAINTY_THRESHOLD ? 1 : 0),
        modelATotal: prev.modelATotal + 1,
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
      setStage('RESULT_3');
    }
  };

  // Filter CSS for stress test visual
  const getFilterStyle = () => {
    if (stage !== 'TEST_2_STRESS') return {};
    return {
      filter: `blur(${stressState.blurLevel * 4}px) brightness(${1 - stressState.darkLevel * 0.5})`,
      transform: `scale(${1 + stressState.cropLevel * 0.4})`
    };
  };

  // Computed stats
  const pct = (n: number, t: number) => t > 0 ? Math.round((n / t) * 100) : 0;
  const stabilityScore = (arr: string[]) => {
    if (arr.length === 0) return 100;
    const stableCount = arr.filter(s => s === 'STABLE').length;
    return Math.round((stableCount / arr.length) * 100);
  };

  // ============================================================
  // SCREENS
  // ============================================================

  if (stage === 'WELCOME') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute top-10 left-10 opacity-10 pointer-events-none -rotate-12">
          <Eye size={120} />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none rotate-12">
          <ShieldCheck size={120} />
        </div>
        <div className="max-w-2xl w-full bg-white border-4 border-black shadow-retro-lg p-10 rounded-lg animate-fade-in relative z-10">
          <div className="space-y-6">
            <div className="inline-block p-4 rounded-full border-2 border-black bg-app-bg shadow-retro-sm mb-4">
              <ShieldCheck size={64} className="text-brand-dark" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-brand-dark uppercase">
              Vision-Duel
            </h1>
            <div className="h-1 w-24 bg-black mx-auto"></div>
            <p className="text-xl text-gray-600 font-mono">Bureau de Certification IA</p>
            <p className="text-lg text-gray-500 font-medium">
              Tu vas certifier une IA. Deux candidates. Même tâche.<br />
              On les teste et tu décides laquelle mérite le certificat.
            </p>
          </div>
          <div className="mt-12 space-y-4">
            <Button onClick={() => setStage('BRIEFING')} className="text-xl px-12 py-4 w-full max-w-sm mx-auto">
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

  if (stage === 'BRIEFING') {
    return (
      <div className="min-h-screen flex flex-col">
        <StageProgress currentStage={0} totalStages={3} title="Briefing" />
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 p-8 max-w-6xl mx-auto w-full">
          <div className="flex-1 bg-white p-8 rounded-lg shadow-retro border-2 border-black flex flex-col items-center text-center space-y-4 animate-slide-up relative" style={{ animationDelay: '0.1s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-blue border-2 border-black px-4 py-1 text-white font-mono font-bold uppercase text-sm">Candidat A</div>
            <div className={`w-24 h-24 rounded-full ${MODEL_A.color} border-2 border-black flex items-center justify-center text-4xl font-black text-white mb-4 shadow-retro-sm`}>{MODEL_A.avatar}</div>
            <h2 className="text-2xl font-black uppercase tracking-tight">{MODEL_A.name}</h2>
            <div className="px-3 py-1 bg-blue-100 text-blue-900 border border-black rounded font-mono text-xs font-bold uppercase">{MODEL_A.type}</div>
            <p className="text-gray-600 leading-relaxed font-medium">{MODEL_A.description}</p>
          </div>
          <div className="text-gray-300 font-black text-4xl italic">VS</div>
          <div className="flex-1 bg-white p-8 rounded-lg shadow-retro border-2 border-black flex flex-col items-center text-center space-y-4 animate-slide-up relative" style={{ animationDelay: '0.2s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-orange border-2 border-black px-4 py-1 text-white font-mono font-bold uppercase text-sm">Candidat B</div>
            <div className={`w-24 h-24 rounded-full ${MODEL_B.color} border-2 border-black flex items-center justify-center text-4xl font-black text-white mb-4 shadow-retro-sm`}>{MODEL_B.avatar}</div>
            <h2 className="text-2xl font-black uppercase tracking-tight">{MODEL_B.name}</h2>
            <div className="px-3 py-1 bg-orange-100 text-orange-900 border border-black rounded font-mono text-xs font-bold uppercase">{MODEL_B.type}</div>
            <p className="text-gray-600 leading-relaxed font-medium">{MODEL_B.description}</p>
          </div>
        </div>
        <div className="p-8 flex justify-center bg-white border-t-4 border-black">
          <Button onClick={() => { setStage('TEST_1_DUEL'); setHasAnswered(false); setPredA(undefined); setPredB(undefined); }} className="w-full max-w-md">
            Initialiser le protocole de test
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'TEST_1_DUEL') {
    const currentImg = test1Images[test1Index];
    return (
      <div className="min-h-screen flex flex-col">
        <StageProgress currentStage={1} totalStages={3} title="Test 1 : Le Duel" subtitle={`Image ${test1Index + 1} / ${test1Images.length}`} />
        <div className="flex-1 flex flex-col md:flex-row p-6 gap-8 max-w-7xl mx-auto w-full">
          <div className="flex-[2] flex flex-col justify-center space-y-6">
            <div className="relative aspect-square md:aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-retro border-4 border-black p-2 bg-white">
              <div className="w-full h-full border-2 border-black overflow-hidden relative">
                <div className="absolute inset-0 pointer-events-none opacity-20 scanline z-10"></div>
                {currentImg && (
                  <img src={currentImg.url} alt="Test" className="w-full h-full object-cover transition-opacity duration-500" key={test1Index} />
                )}
              </div>
            </div>

            {!hasAnswered ? (
              <div className="grid grid-cols-2 gap-6">
                <Button onClick={() => handleTest1Answer('PAS_CHAT')} disabled={isAnalyzing} className="h-20 text-xl" variant="secondary">PAS CHAT</Button>
                <Button onClick={() => handleTest1Answer('CHAT')} disabled={isAnalyzing} className="h-20 text-xl">CHAT</Button>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button onClick={goToNextTest1} className="px-12 py-4 text-lg">
                  {test1Index < test1Images.length - 1 ? 'Suivant' : 'Voir les resultats'} <ArrowRight className="inline ml-2" size={20} />
                </Button>
              </div>
            )}

            {/* Live scoreboard */}
            {test1Scores.humanTotal > 0 && (
              <div className="grid grid-cols-3 gap-4 text-center bg-white border-2 border-black rounded p-4 shadow-retro-sm">
                <div>
                  <div className="text-2xl font-black text-brand-dark">{test1Scores.humanCorrect}/{test1Scores.humanTotal}</div>
                  <div className="text-xs text-gray-500 font-mono uppercase">Toi</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-brand-blue">{test1Scores.modelACorrect}/{test1Scores.modelATotal}</div>
                  <div className="text-xs text-gray-500 font-mono uppercase">IA A</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-brand-orange">{test1Scores.modelBCorrect}/{test1Scores.modelBTotal}</div>
                  <div className="text-xs text-gray-500 font-mono uppercase">IA B</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1"><AICard model={MODEL_A} prediction={predA} loading={isAnalyzing} /></div>
            <div className="flex-1"><AICard model={MODEL_B} prediction={predB} loading={isAnalyzing} /></div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'RESULT_1') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-8 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
        <div className="max-w-4xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-12 text-center space-y-8 animate-fade-in z-10">
          <div className="inline-flex items-center justify-center p-4 bg-green-100 border-2 border-black rounded-full text-green-700 mb-4 shadow-retro-sm">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tight">Résultat du Duel</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sur des cas standard, les deux IA semblent fiables. Ce test ne suffit pas pour les départager.
          </p>
          <div className="grid grid-cols-3 gap-8 py-8 border-t-2 border-b-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="text-5xl font-black text-brand-dark mb-2">{pct(test1Scores.humanCorrect, test1Scores.humanTotal)}%</div>
              <div className="text-gray-500 font-mono text-sm uppercase">Toi</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-brand-blue mb-2">{pct(test1Scores.modelACorrect, test1Scores.modelATotal)}%</div>
              <div className="text-gray-500 font-mono text-sm uppercase">IA A ({MODEL_A.type})</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-brand-orange mb-2">{pct(test1Scores.modelBCorrect, test1Scores.modelBTotal)}%</div>
              <div className="text-gray-500 font-mono text-sm uppercase">IA B ({MODEL_B.type})</div>
            </div>
          </div>
          <p className="text-sm text-gray-500 italic font-mono">
            "Sur des cas standards, tout semble intelligent. Mais ce test ne suffit pas."
          </p>
          <Button onClick={() => { setStage('TEST_2_STRESS'); setPredA(undefined); setPredB(undefined); setStressState({ blurLevel: 0, darkLevel: 0, cropLevel: 0 }); }} className="w-full max-w-sm mx-auto">
            Passer au Stress Test <ArrowRight className="inline ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'TEST_2_STRESS') {
    const currentImg = test2Images[test2Index];
    const stabilityBadge = (s?: string) => {
      if (!s || s === 'STABLE') return <span className="bg-green-100 text-green-800 border border-green-500 px-2 py-1 rounded font-mono text-xs font-bold">STABLE</span>;
      if (s === 'FRAGILE') return <span className="bg-yellow-100 text-yellow-800 border border-yellow-500 px-2 py-1 rounded font-mono text-xs font-bold animate-pulse">FRAGILE</span>;
      return <span className="bg-red-100 text-red-800 border border-red-500 px-2 py-1 rounded font-mono text-xs font-bold animate-pulse">CASSE</span>;
    };

    return (
      <div className="min-h-screen flex flex-col">
        <StageProgress currentStage={2} totalStages={3} title="Test 2 : Stress Test" subtitle={`Image ${test2Index + 1} / ${test2Images.length} — Modifiez l'image`} />
        <div className="flex-1 flex flex-col md:flex-row p-6 gap-8 max-w-7xl mx-auto w-full">
          <div className="flex-[2] flex flex-col justify-center space-y-6">
            <div className="relative aspect-square md:aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-retro border-4 border-black p-2 bg-white">
              <div className="w-full h-full border-2 border-black overflow-hidden relative bg-black">
                <div className="w-full h-full overflow-hidden transition-all duration-300 ease-out" style={getFilterStyle()}>
                  {currentImg && <img src={currentImg.url} alt="Stress Test" className="w-full h-full object-cover" />}
                </div>
                <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded border border-white/20 text-xs font-mono uppercase tracking-widest z-20">
                  Mode Robustesse
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-retro-sm border-2 border-black">
              <h3 className="text-sm font-bold text-gray-500 font-mono uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Panneau de Perturbation</h3>
              <div className="grid grid-cols-3 gap-4">
                <button onClick={() => toggleStress('dark')}
                  className={`flex flex-col items-center justify-center p-4 rounded border-2 transition-all ${stressState.darkLevel > 0 ? 'bg-black text-white border-black shadow-retro-sm translate-x-[2px] translate-y-[2px]' : 'bg-white text-gray-800 border-black hover:bg-gray-50'}`}>
                  <Sun size={24} className="mb-2" /><span className="font-bold text-sm uppercase">Assombrir</span>
                </button>
                <button onClick={() => toggleStress('crop')}
                  className={`flex flex-col items-center justify-center p-4 rounded border-2 transition-all ${stressState.cropLevel > 0 ? 'bg-black text-white border-black shadow-retro-sm translate-x-[2px] translate-y-[2px]' : 'bg-white text-gray-800 border-black hover:bg-gray-50'}`}>
                  <Crop size={24} className="mb-2" /><span className="font-bold text-sm uppercase">Recadrer</span>
                </button>
                <button onClick={() => toggleStress('blur')}
                  className={`flex flex-col items-center justify-center p-4 rounded border-2 transition-all ${stressState.blurLevel > 0 ? 'bg-black text-white border-black shadow-retro-sm translate-x-[2px] translate-y-[2px]' : 'bg-white text-gray-800 border-black hover:bg-gray-50'}`}>
                  <Aperture size={24} className="mb-2" /><span className="font-bold text-sm uppercase">Flou</span>
                </button>
              </div>
            </div>

            {/* Stability indicators */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border-2 border-black rounded p-4 flex items-center justify-between shadow-retro-sm">
                <span className="font-mono text-sm font-bold uppercase text-brand-blue">IA A</span>
                {stabilityBadge(predA?.stability)}
              </div>
              <div className="bg-white border-2 border-black rounded p-4 flex items-center justify-between shadow-retro-sm">
                <span className="font-mono text-sm font-bold uppercase text-brand-orange">IA B</span>
                {stabilityBadge(predB?.stability)}
              </div>
            </div>

            <div className="flex justify-between items-center px-2">
              <button onClick={() => setStressState({ blurLevel: 0, darkLevel: 0, cropLevel: 0 })} className="text-sm text-gray-500 underline hover:text-black font-mono uppercase">Réinitialiser</button>
              <Button onClick={goToNextTest2}>
                {test2Index < test2Images.length - 1 ? 'Suivant' : 'Voir les resultats'} <ArrowRight className="inline ml-2" size={18} />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1"><AICard model={MODEL_A} prediction={predA} highlightStability={true} /></div>
            <div className="flex-1"><AICard model={MODEL_B} prediction={predB} highlightStability={true} /></div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'RESULT_2') {
    const aStab = stabilityScore(stressResults.modelAStability);
    const bStab = stabilityScore(stressResults.modelBStability);
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-8 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
        <div className="max-w-4xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-12 text-center space-y-8 animate-fade-in z-10">
          <div className="inline-flex items-center justify-center p-4 bg-yellow-100 border-2 border-black rounded-full text-yellow-700 mb-4 shadow-retro-sm">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tight">Le spécialiste craque !</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Une IA peut être excellente sur des images propres, mais fragile dès que la photo est un peu différente.
          </p>
          <div className="flex justify-center gap-8 py-8">
            <div className="p-6 bg-red-50 rounded border-2 border-black w-1/2 shadow-sm">
              <h4 className="font-bold text-red-800 mb-2 font-mono uppercase">IA A</h4>
              <div className="text-4xl font-black text-red-600">{aStab}%</div>
              <p className="text-xs text-red-500 mt-2 font-mono">stabilité sous stress</p>
            </div>
            <div className="p-6 bg-green-50 rounded border-2 border-black w-1/2 shadow-sm">
              <h4 className="font-bold text-green-800 mb-2 font-mono uppercase">IA B</h4>
              <div className="text-4xl font-black text-green-600">{bStab}%</div>
              <p className="text-xs text-green-500 mt-2 font-mono">stabilité sous stress</p>
            </div>
          </div>
          <Button onClick={() => { setStage('TEST_3_UNCERTAINTY'); setHasAnswered(false); setPredA(undefined); setPredB(undefined); }} className="w-full max-w-sm mx-auto">
            Dernier test : Incertitude <ArrowRight className="inline ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'TEST_3_UNCERTAINTY') {
    const currentImg = test3Images[test3Index];
    return (
      <div className="min-h-screen flex flex-col">
        <StageProgress currentStage={3} totalStages={3} title="Test 3 : L'Incertitude" subtitle={`Image ${test3Index + 1} / ${test3Images.length} — Images ambigues`} />
        <div className="bg-white border-b-4 border-black p-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-gray-600 font-mono">
              Seuil de doute : si la confiance est sous <strong>{UNCERTAINTY_THRESHOLD}%</strong>, l'IA devrait dire "Je ne sais pas".
            </p>
          </div>
        </div>
        <div className="flex-1 flex flex-col md:flex-row p-6 gap-8 max-w-7xl mx-auto w-full">
          <div className="flex-[2] flex flex-col justify-center space-y-6">
            <div className="relative aspect-square md:aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-retro border-4 border-black p-2 bg-white">
              <div className="w-full h-full border-2 border-black overflow-hidden relative">
                {currentImg && <img src={currentImg.url} alt="Uncertainty Test" className="w-full h-full object-cover" key={test3Index} />}
              </div>
            </div>

            {!hasAnswered ? (
              <div className="grid grid-cols-3 gap-4">
                <Button onClick={() => handleTest3Answer('PAS_CHAT')} disabled={isAnalyzing} variant="secondary" className="text-lg h-16">PAS CHAT</Button>
                <Button onClick={() => handleTest3Answer('IDK')} disabled={isAnalyzing} className="bg-brand-dark text-white hover:bg-black border-2 border-black text-lg h-16">JE NE SAIS PAS</Button>
                <Button onClick={() => handleTest3Answer('CHAT')} disabled={isAnalyzing} className="text-lg h-16">CHAT</Button>
              </div>
            ) : (
              <div className="flex justify-center">
                <Button onClick={goToNextTest3} className="px-12 py-4 text-lg">
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
      <div className="min-h-screen flex flex-col justify-center items-center p-8 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
        <div className="max-w-4xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-12 text-center space-y-8 animate-fade-in z-10">
          <div className="inline-flex items-center justify-center p-4 bg-purple-100 border-2 border-black rounded-full text-purple-700 mb-4 shadow-retro-sm">
            <Eye size={48} />
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tight">Savoir s'abstenir</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Répondre moins peut éviter des erreurs : tout dépend du contexte d'usage.
          </p>
          <div className="bg-gray-50 p-6 rounded border-2 border-black text-left max-w-lg mx-auto shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <span className="text-gray-500 font-mono uppercase text-sm">Erreurs de IA A (trop confiante)</span>
              <span className="font-black text-red-500 text-2xl">{uncertaintyResults.modelAOverconfidentErrors}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-mono uppercase text-sm">Abstentions de IA B (prudente)</span>
              <span className="font-black text-blue-500 text-2xl">{uncertaintyResults.modelBAbstentions}</span>
            </div>
          </div>
          <Button onClick={() => setStage('CERTIFICATION')} className="w-full max-w-sm mx-auto">
            Délivrer le certificat <ArrowRight className="inline ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'CERTIFICATION') {
    const scoreA_T1 = pct(test1Scores.modelACorrect, test1Scores.modelATotal);
    const scoreB_T1 = pct(test1Scores.modelBCorrect, test1Scores.modelBTotal);
    const scoreA_T2 = stabilityScore(stressResults.modelAStability);
    const scoreB_T2 = stabilityScore(stressResults.modelBStability);
    const scoreA_T3 = uncertaintyResults.modelATotal > 0 ? pct(uncertaintyResults.modelATotal - uncertaintyResults.modelAOverconfidentErrors, uncertaintyResults.modelATotal) : 0;
    const scoreB_T3 = uncertaintyResults.modelBTotal > 0 ? pct(uncertaintyResults.modelBTotal, uncertaintyResults.modelBTotal) : 0;

    const resetAll = () => {
      setStage('WELCOME');
      setTest1Index(0); setTest2Index(0); setTest3Index(0);
      setPredA(undefined); setPredB(undefined);
      setHasAnswered(false); setIsAnalyzing(false);
      setStressState({ blurLevel: 0, darkLevel: 0, cropLevel: 0 });
      setTest1Scores({ humanCorrect: 0, humanTotal: 0, modelACorrect: 0, modelATotal: 0, modelBCorrect: 0, modelBTotal: 0 });
      setStressResults({ modelAStability: [], modelBStability: [] });
      setUncertaintyResults({ modelAOverconfidentErrors: 0, modelBAbstentions: 0, modelATotal: 0, modelBTotal: 0 });
    };

    const certify = (model: string) => {
      if (model === 'B') {
        alert("Bravo ! Tu as privilegie la fiabilite a la performance pure. C'est la bonne approche en conditions reelles.");
      } else {
        alert("Attention ! L'IA A est performante sur des cas standards mais fragile. En conditions reelles, la fiabilite compte plus que la precision brute.");
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
        <div className="absolute top-10 left-10 opacity-10 pointer-events-none -rotate-12"><Eye size={120} /></div>
        <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none rotate-12"><ShieldCheck size={120} /></div>
        <div className="w-full max-w-5xl bg-white border-4 border-black shadow-retro-lg p-6 md:p-10 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">Passeport de Certification</h2>
            <p className="font-mono text-gray-600 text-sm md:text-base">Analyse terminée. Sélectionne le modèle le plus fiable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-12">
            {/* Model A */}
            <div className="bg-blue-50 border-2 border-blue-900 p-6 rounded-lg relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-blue text-white px-4 py-1 font-bold font-mono text-sm uppercase tracking-widest border-2 border-black">IA A</div>
              <div className="mt-4 space-y-6">
                {[
                  { label: 'Standard (Duel)', score: scoreA_T1, desc: 'images propres' },
                  { label: 'Robustesse (Stress)', score: scoreA_T2, desc: 'stabilité aux variations' },
                  { label: 'Prudence (Incertitude)', score: scoreA_T3, desc: '"Je ne sais pas"' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-sm uppercase">{item.label}</span>
                      <span className={`font-mono text-sm font-bold ${item.score < 60 ? 'text-red-600' : 'text-gray-800'}`}>{item.score}%</span>
                    </div>
                    <div className="w-full bg-blue-200 h-4 border border-black rounded-full overflow-hidden">
                      <div className="bg-brand-blue h-full animate-fill" style={{ width: `${item.score}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 italic">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <button onClick={() => certify('A')} className="bg-brand-blue hover:bg-blue-600 text-white font-bold py-3 px-6 w-full border-2 border-black shadow-retro active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase tracking-wide flex items-center justify-center gap-2">
                  <Stamp size={18} />Certifier IA A
                </button>
              </div>
            </div>

            {/* Model B */}
            <div className="bg-orange-50 border-2 border-orange-900 p-6 rounded-lg relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-orange text-white px-4 py-1 font-bold font-mono text-sm uppercase tracking-widest border-2 border-black">IA B</div>
              <div className="mt-4 space-y-6">
                {[
                  { label: 'Standard (Duel)', score: scoreB_T1, desc: 'images propres' },
                  { label: 'Robustesse (Stress)', score: scoreB_T2, desc: 'stabilité aux variations' },
                  { label: 'Prudence (Incertitude)', score: scoreB_T3, desc: '"Je ne sais pas"' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="font-bold text-sm uppercase">{item.label}</span>
                      <span className={`font-mono text-sm font-bold ${item.score >= 80 ? 'text-green-700' : 'text-gray-800'}`}>{item.score}%</span>
                    </div>
                    <div className="w-full bg-orange-200 h-4 border border-black rounded-full overflow-hidden">
                      <div className="bg-brand-orange h-full animate-fill" style={{ width: `${item.score}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 italic">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <button onClick={() => certify('B')} className="bg-brand-orange hover:bg-orange-600 text-white font-bold py-3 px-6 w-full border-2 border-black shadow-retro active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase tracking-wide flex items-center justify-center gap-2">
                  <Stamp size={18} />Certifier IA B
                </button>
              </div>
            </div>
          </div>

          <div className="border-t-4 border-dashed border-gray-300 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <h3 className="font-black text-lg uppercase mb-4 flex items-center gap-2 text-gray-800">
                  <ShieldCheck size={24} />3 Règles à emporter
                </h3>
                <ul className="space-y-3 font-mono text-sm text-gray-700">
                  {[
                    'Tester au-delà des cas faciles.',
                    'Vérifier la robustesse aux variations.',
                    "Gérer l'incertitude (ne pas forcer une réponse).",
                  ].map((rule, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 border-2 border-black flex items-center justify-center bg-yellow-300 flex-shrink-0">
                        <span className="font-bold text-xs">{i + 1}</span>
                      </div>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <button onClick={() => setStage('BONUS_MENU')} className="w-full md:w-auto bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold py-3 px-8 border-2 border-purple-400 shadow-retro active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-sm flex items-center justify-center gap-2">
                  <Brain size={18} />Petit plus pour les curieux
                </button>
                <button onClick={resetAll} className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 border-2 border-black shadow-retro active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-sm flex items-center justify-center gap-2">
                  <RefreshCw size={18} />Recommencer
                </button>
              </div>
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
      <div className="min-h-screen flex flex-col items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
        <div className="max-w-3xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-10 text-center space-y-8 animate-fade-in z-10">
          <div className="inline-flex items-center justify-center p-4 bg-purple-100 border-2 border-black rounded-full text-purple-700 mb-4 shadow-retro-sm">
            <Brain size={48} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Petit plus pour les curieux</h2>
          <p className="text-gray-600 font-medium">Deux bonus optionnels pour aller plus loin.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setStage('BONUS_A1')}
              className="bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-400 p-6 rounded-lg text-left transition-all hover:shadow-retro-sm group"
            >
              <div className="flex items-center gap-3 mb-3">
                <Sparkles size={28} className="text-indigo-600" />
                <h3 className="font-black text-lg uppercase text-indigo-900">Bonus A</h3>
              </div>
              <p className="font-bold text-indigo-800 mb-2">Dans la tête du modele</p>
              <p className="text-sm text-indigo-600 font-mono">Comment le modèle apprend-il ? 3 écrans, 30 secondes.</p>
            </button>

            <button
              onClick={() => setStage('BONUS_B')}
              className="bg-amber-50 hover:bg-amber-100 border-2 border-amber-400 p-6 rounded-lg text-left transition-all hover:shadow-retro-sm group"
            >
              <div className="flex items-center gap-3 mb-3">
                <BookOpen size={28} className="text-amber-600" />
                <h3 className="font-black text-lg uppercase text-amber-900">Bonus B</h3>
              </div>
              <p className="font-bold text-amber-800 mb-2">Surapprentissage en 30 secondes</p>
              <p className="text-sm text-amber-600 font-mono">Apprendre parfaitement... ne veut pas dire généraliser.</p>
            </button>

            <button
              onClick={() => { setBonusCFailure(null); setBonusCDiagnosis(null); setBonusCKit(null); setStage('BONUS_C_INTRO'); }}
              className="bg-green-50 hover:bg-green-100 border-2 border-green-400 p-6 rounded-lg text-left transition-all hover:shadow-retro-sm group md:col-span-2"
            >
              <div className="flex items-center gap-3 mb-3">
                <Wrench size={28} className="text-green-600" />
                <h3 className="font-black text-lg uppercase text-green-900">Bonus C</h3>
              </div>
              <p className="font-bold text-green-800 mb-2">Atelier de Réparation</p>
              <p className="text-sm text-green-600 font-mono">Diagnostiquez une panne IA et réparez-la avec de meilleures données.</p>
            </button>
          </div>

          <div className="text-center pt-6">
            <button onClick={() => setStage('CERTIFICATION')} className="text-gray-500 hover:text-gray-800 font-mono text-sm underline">
              Retour à la certification
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
            <Button onClick={() => setStage('CERTIFICATION')}>
              Retour à la certification
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
            <Button onClick={() => setStage('CERTIFICATION')}>
              Retour à la certification
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