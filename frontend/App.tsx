import React, { useState, useEffect } from 'react';
import { ScreenStage, StressState, Prediction } from './types';
import { MODEL_A, MODEL_B, TEST_1_IMAGES, TEST_2_IMAGES, TEST_3_IMAGES } from './constants';
import { Button } from './components/Button';
import { AICard } from './components/AICard';
import { StageProgress } from './components/StageProgress';
import { ArrowRight, CheckCircle, AlertTriangle, ShieldCheck, Eye, RefreshCw, Sun, Crop, Aperture, Stamp } from 'lucide-react';

const App: React.FC = () => {
  const [stage, setStage] = useState<ScreenStage>('WELCOME');
  
  // --- TEST 1 STATE ---
  const [test1Index, setTest1Index] = useState(0);
  const [test1Predictions, setTest1Predictions] = useState<{A: Prediction | undefined, B: Prediction | undefined}>({A: undefined, B: undefined});
  
  // --- TEST 2 STATE (Stress) ---
  const [test2Index, setTest2Index] = useState(0);
  const [stressState, setStressState] = useState<StressState>({ blurLevel: 0, darkLevel: 0, cropLevel: 0 });
  
  // --- TEST 3 STATE (Uncertainty) ---
  const [test3Index, setTest3Index] = useState(0);
  const [uncertaintyThreshold, setUncertaintyThreshold] = useState<'LOW' | 'HIGH'>('HIGH'); // Starts high (model B is smart)
  
  // --- ANIMATION STATES ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --------------------------------------------------------------------------
  // LOGIC: TEST 1 (DUEL)
  // --------------------------------------------------------------------------
  const handleTest1Choice = () => {
    setIsAnalyzing(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Mock Logic: Both models perform well on standard images
      // A is slightly more confident
      const currentImg = TEST_1_IMAGES[test1Index];
      const isCat = currentImg.truth === 'CHAT';
      
      setTest1Predictions({
        A: { 
          label: isCat ? 'CHAT' : 'PAS CHAT', 
          confidence: Math.floor(95 + Math.random() * 4) 
        },
        B: { 
          label: isCat ? 'CHAT' : 'PAS CHAT', 
          confidence: Math.floor(88 + Math.random() * 6) 
        }
      });
      setIsAnalyzing(false);

      // Auto advance after brief delay
      setTimeout(() => {
        if (test1Index < TEST_1_IMAGES.length - 1) {
          setTest1Index(prev => prev + 1);
          setTest1Predictions({A: undefined, B: undefined});
        } else {
          setStage('RESULT_1');
        }
      }, 1500);
    }, 600);
  };

  // --------------------------------------------------------------------------
  // LOGIC: TEST 2 (STRESS)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (stage === 'TEST_2_STRESS') {
      updateStressPredictions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stressState, stage, test2Index]);

  const updateStressPredictions = () => {
    const totalStress = stressState.blurLevel + stressState.darkLevel + stressState.cropLevel;
    
    // Model A crashes easily. Model B resists.
    // A: Confidence drops 15% per stress point.
    // B: Confidence drops 3% per stress point.
    
    const baseConfA = 98;
    const baseConfB = 92;
    
    const currentConfA = Math.max(10, baseConfA - (totalStress * 25)); // A drops FAST
    const currentConfB = Math.max(10, baseConfB - (totalStress * 5));  // B stays stable
    
    // Logic: If confidence < 50, label flips or becomes random
    const isCat = TEST_2_IMAGES[test2Index].truth === 'CHAT';
    
    setTest1Predictions({
      A: {
        label: currentConfA < 50 ? (isCat ? 'PAS CHAT' : 'CHAT') : (isCat ? 'CHAT' : 'PAS CHAT'),
        confidence: currentConfA,
        isStable: currentConfA > 60
      },
      B: {
        label: isCat ? 'CHAT' : 'PAS CHAT',
        confidence: currentConfB,
        isStable: currentConfB > 60
      }
    });
  };

  const toggleStress = (type: 'blur' | 'dark' | 'crop') => {
    setStressState(prev => {
      const newVal = prev[`${type}Level` as keyof StressState] === 0 ? 1 : 0; // Simple toggle for UI clarity
      return { ...prev, [`${type}Level` as keyof StressState]: newVal };
    });
  };

  const resetStress = () => {
    setStressState({ blurLevel: 0, darkLevel: 0, cropLevel: 0 });
  };

  // --------------------------------------------------------------------------
  // LOGIC: TEST 3 (UNCERTAINTY)
  // --------------------------------------------------------------------------
  const handleTest3Choice = (choice: 'CHAT' | 'PAS CHAT' | 'IDK') => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const currentImg = TEST_3_IMAGES[test3Index];
      const isAmbiguous = currentImg.isAmbiguous;
      
      // Model A: Overconfident even when wrong or ambiguous
      // Model B: Says INCERTAIN if threshold is high and image is ambiguous
      
      const predA: Prediction = {
        label: currentImg.truth === 'CHAT' ? 'CHAT' : 'PAS CHAT', // A is often wrong on ambiguous
        confidence: isAmbiguous ? 85 : 95 // High confidence even if ambiguous
      };

      let predB: Prediction;
      
      if (uncertaintyThreshold === 'HIGH' && isAmbiguous) {
        predB = { label: 'INCERTAIN', confidence: 45 };
      } else {
        predB = {
          label: currentImg.truth === 'CHAT' ? 'CHAT' : 'PAS CHAT',
          confidence: isAmbiguous ? 60 : 90
        };
      }
      
      setTest1Predictions({ A: predA, B: predB });
      setIsAnalyzing(false);

      setTimeout(() => {
        if (test3Index < TEST_3_IMAGES.length - 1) {
          setTest3Index(prev => prev + 1);
          setTest1Predictions({A: undefined, B: undefined});
        } else {
          setStage('RESULT_3');
        }
      }, 2000);

    }, 600);
  };

  // --------------------------------------------------------------------------
  // RENDER HELPERS
  // --------------------------------------------------------------------------
  const getFilterStyle = () => {
    if (stage !== 'TEST_2_STRESS') return {};
    return {
      filter: `blur(${stressState.blurLevel * 4}px) brightness(${1 - stressState.darkLevel * 0.5})`,
      transform: `scale(${1 + stressState.cropLevel * 0.4})`
    };
  };

  // --------------------------------------------------------------------------
  // SCREENS
  // --------------------------------------------------------------------------

  if (stage === 'WELCOME') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Decorative background icons */}
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
               VisionDuel
             </h1>
             <div className="h-1 w-24 bg-black mx-auto"></div>
             <p className="text-xl text-gray-600 font-mono">
               Bureau de Certification IA
             </p>
             <p className="text-lg text-gray-500 font-medium">
                Deux candidates. Une tâche unique.<br/>
                Laquelle mérite votre confiance ?
             </p>
          </div>
          
          <div className="mt-12">
            <Button onClick={() => setStage('BRIEFING')} className="text-xl px-12 py-4 w-full max-w-sm mx-auto">
                Démarrer l'inspection
            </Button>
          </div>

          <p className="text-xs text-gray-400 font-mono uppercase tracking-widest pt-8">
            Session #8392-X • Durée estimée : 6 min
          </p>
        </div>
      </div>
    );
  }

  if (stage === 'BRIEFING') {
    return (
      <div className="min-h-screen flex flex-col">
        <StageProgress currentStage={0} totalStages={3} title="Briefing" />
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 p-8 max-w-6xl mx-auto w-full">
          
          {/* Model A Card */}
          <div className="flex-1 bg-white p-8 rounded-lg shadow-retro border-2 border-black flex flex-col items-center text-center space-y-4 animate-slide-up relative" style={{animationDelay: '0.1s'}}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-blue border-2 border-black px-4 py-1 text-white font-mono font-bold uppercase text-sm">Candidat A</div>
            <div className={`w-24 h-24 rounded-full ${MODEL_A.color} border-2 border-black flex items-center justify-center text-5xl mb-4 shadow-retro-sm`}>
              {MODEL_A.avatar}
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">{MODEL_A.name}</h2>
            <div className="px-3 py-1 bg-blue-100 text-blue-900 border border-black rounded font-mono text-xs font-bold uppercase">{MODEL_A.type}</div>
            <p className="text-gray-600 leading-relaxed font-medium">
              {MODEL_A.description}
            </p>
          </div>

          <div className="text-gray-300 font-black text-4xl italic">VS</div>

          {/* Model B Card */}
          <div className="flex-1 bg-white p-8 rounded-lg shadow-retro border-2 border-black flex flex-col items-center text-center space-y-4 animate-slide-up relative" style={{animationDelay: '0.2s'}}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-orange border-2 border-black px-4 py-1 text-white font-mono font-bold uppercase text-sm">Candidat B</div>
            <div className={`w-24 h-24 rounded-full ${MODEL_B.color} border-2 border-black flex items-center justify-center text-5xl mb-4 shadow-retro-sm`}>
              {MODEL_B.avatar}
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">{MODEL_B.name}</h2>
            <div className="px-3 py-1 bg-orange-100 text-orange-900 border border-black rounded font-mono text-xs font-bold uppercase">{MODEL_B.type}</div>
            <p className="text-gray-600 leading-relaxed font-medium">
              {MODEL_B.description}
            </p>
          </div>
        </div>
        <div className="p-8 flex justify-center bg-white border-t-4 border-black">
           <Button onClick={() => setStage('TEST_1_DUEL')} className="w-full max-w-md">Initialiser le protocole de test</Button>
        </div>
      </div>
    );
  }

  if (stage === 'TEST_1_DUEL') {
    return (
      <div className="min-h-screen flex flex-col">
        <StageProgress 
          currentStage={1} 
          totalStages={3} 
          title="Test 1 : Le Duel" 
          subtitle={`Image ${test1Index + 1} / ${TEST_1_IMAGES.length}`} 
        />
        
        <div className="flex-1 flex flex-col md:flex-row p-6 gap-8 max-w-7xl mx-auto w-full">
          {/* Left: Image & Controls */}
          <div className="flex-[2] flex flex-col justify-center space-y-6">
            <div className="relative aspect-square md:aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-retro border-4 border-black p-2 bg-white">
               <div className="w-full h-full border-2 border-black overflow-hidden relative">
                   <div className="absolute inset-0 pointer-events-none opacity-20 scanline z-10"></div>
                   <img 
                     src={TEST_1_IMAGES[test1Index].url} 
                     alt="Test" 
                     className="w-full h-full object-cover transition-opacity duration-500"
                     key={test1Index} 
                   />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Button onClick={handleTest1Choice} disabled={isAnalyzing || !!test1Predictions.A} className="h-20 text-xl" variant="secondary">PAS CHAT</Button>
              <Button onClick={handleTest1Choice} disabled={isAnalyzing || !!test1Predictions.A} className="h-20 text-xl">CHAT</Button>
            </div>
          </div>

          {/* Right: AI Results */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1">
              <AICard model={MODEL_A} prediction={test1Predictions.A} loading={isAnalyzing} />
            </div>
            <div className="flex-1">
              <AICard model={MODEL_B} prediction={test1Predictions.B} loading={isAnalyzing} />
            </div>
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
          <h2 className="text-4xl font-black uppercase tracking-tight">Résultat : Match Nul</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Sur des images "standards", les deux IA semblent aussi intelligentes et fiables l'une que l'autre. Impossible de les départager ici.
          </p>
          <div className="grid grid-cols-2 gap-8 py-8 border-t-2 border-b-2 border-dashed border-gray-300">
             <div className="text-center">
                <div className="text-5xl font-black text-brand-blue mb-2">98%</div>
                <div className="text-gray-500 font-mono text-sm uppercase">Précision Modèle A</div>
             </div>
             <div className="text-center">
                <div className="text-5xl font-black text-brand-orange mb-2">97%</div>
                <div className="text-gray-500 font-mono text-sm uppercase">Précision Modèle B</div>
             </div>
          </div>
          <Button onClick={() => setStage('TEST_2_STRESS')} className="w-full max-w-sm mx-auto">
            Passer au Stress Test <ArrowRight className="inline ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'TEST_2_STRESS') {
    return (
      <div className="min-h-screen flex flex-col">
        <StageProgress 
          currentStage={2} 
          totalStages={3} 
          title="Test 2 : Stress Test" 
          subtitle="Modifiez l'image pour tester la robustesse" 
        />
        
        <div className="flex-1 flex flex-col md:flex-row p-6 gap-8 max-w-7xl mx-auto w-full">
          {/* Left: Image & Controls */}
          <div className="flex-[2] flex flex-col justify-center space-y-6">
            <div className="relative aspect-square md:aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-retro border-4 border-black p-2 bg-white">
               <div className="w-full h-full border-2 border-black overflow-hidden relative bg-black group">
                  <div className="w-full h-full overflow-hidden transition-all duration-300 ease-out" style={getFilterStyle()}>
                      <img 
                        src={TEST_2_IMAGES[test2Index].url} 
                        alt="Stress Test" 
                        className="w-full h-full object-cover"
                      />
                  </div>
                  <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded border border-white/20 text-xs font-mono uppercase tracking-widest z-20">
                    Mode Robustesse
                  </div>
               </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-retro-sm border-2 border-black">
              <h3 className="text-sm font-bold text-gray-500 font-mono uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Panneau de Perturbation</h3>
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => toggleStress('dark')}
                  className={`flex flex-col items-center justify-center p-4 rounded border-2 transition-all ${stressState.darkLevel > 0 ? 'bg-black text-white border-black shadow-retro-sm translate-x-[2px] translate-y-[2px]' : 'bg-white text-gray-800 border-black hover:bg-gray-50'}`}
                >
                  <Sun size={24} className="mb-2" />
                  <span className="font-bold text-sm uppercase">Assombrir</span>
                </button>
                <button 
                  onClick={() => toggleStress('crop')}
                  className={`flex flex-col items-center justify-center p-4 rounded border-2 transition-all ${stressState.cropLevel > 0 ? 'bg-black text-white border-black shadow-retro-sm translate-x-[2px] translate-y-[2px]' : 'bg-white text-gray-800 border-black hover:bg-gray-50'}`}
                >
                  <Crop size={24} className="mb-2" />
                  <span className="font-bold text-sm uppercase">Recadrer</span>
                </button>
                <button 
                  onClick={() => toggleStress('blur')}
                  className={`flex flex-col items-center justify-center p-4 rounded border-2 transition-all ${stressState.blurLevel > 0 ? 'bg-black text-white border-black shadow-retro-sm translate-x-[2px] translate-y-[2px]' : 'bg-white text-gray-800 border-black hover:bg-gray-50'}`}
                >
                  <Aperture size={24} className="mb-2" />
                  <span className="font-bold text-sm uppercase">Flou</span>
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center px-2">
               <button onClick={resetStress} className="text-sm text-gray-500 underline hover:text-black font-mono uppercase">Réinitialiser</button>
               <Button onClick={() => setStage('RESULT_2')} className="">Terminer ce test</Button>
            </div>
          </div>

          {/* Right: AI Results */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1">
              <AICard model={MODEL_A} prediction={test1Predictions.A} highlightStability={true} />
            </div>
            <div className="flex-1">
              <AICard model={MODEL_B} prediction={test1Predictions.B} highlightStability={true} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'RESULT_2') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-8 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>
        <div className="max-w-4xl w-full bg-white rounded-lg border-4 border-black shadow-retro-lg p-12 text-center space-y-8 animate-fade-in z-10">
          <div className="inline-flex items-center justify-center p-4 bg-yellow-100 border-2 border-black rounded-full text-yellow-700 mb-4 shadow-retro-sm">
            <AlertTriangle size={48} />
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tight">Le spécialiste craque !</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Dès qu'on change les conditions (lumière, cadrage), le Modèle A perd ses moyens et change d'avis. Le Modèle B reste cohérent.
          </p>
          
          <div className="flex justify-center gap-8 py-8">
             <div className="p-6 bg-red-50 rounded border-2 border-black w-1/2 shadow-sm">
               <h4 className="font-bold text-red-800 mb-2 font-mono uppercase">Modèle A</h4>
               <div className="text-3xl font-black text-red-600 uppercase">FRAGILE</div>
               <p className="text-xs text-red-500 mt-2 font-mono">Sa confiance chute drastiquement</p>
             </div>
             <div className="p-6 bg-green-50 rounded border-2 border-black w-1/2 shadow-sm">
               <h4 className="font-bold text-green-800 mb-2 font-mono uppercase">Modèle B</h4>
               <div className="text-3xl font-black text-green-600 uppercase">ROBUSTE</div>
               <p className="text-xs text-green-500 mt-2 font-mono">Reste stable sous la contrainte</p>
             </div>
          </div>

          <Button onClick={() => setStage('TEST_3_UNCERTAINTY')} className="w-full max-w-sm mx-auto">
            Dernier test : Incertitude <ArrowRight className="inline ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (stage === 'TEST_3_UNCERTAINTY') {
    return (
      <div className="min-h-screen flex flex-col">
        <StageProgress 
          currentStage={3} 
          totalStages={3} 
          title="Test 3 : L'Incertitude" 
          subtitle={`Cas ${test3Index + 1} / ${TEST_3_IMAGES.length} - Images ambiguës`} 
        />
        
        <div className="bg-white border-b-4 border-black p-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <span className="text-sm font-bold text-brand-dark uppercase tracking-wide font-mono flex items-center gap-2">
                <span className="material-symbols-outlined">tune</span>
                Paramètre du système : Seuil de doute
            </span>
            <div className="flex bg-gray-100 rounded border border-black p-1 shadow-inner">
              <button 
                onClick={() => setUncertaintyThreshold('LOW')}
                className={`px-4 py-2 rounded-sm text-sm font-bold uppercase transition-colors ${uncertaintyThreshold === 'LOW' ? 'bg-brand-blue text-white shadow-sm border border-black' : 'text-gray-500 hover:text-black'}`}
              >
                Audacieux
              </button>
              <button 
                onClick={() => setUncertaintyThreshold('HIGH')}
                className={`px-4 py-2 rounded-sm text-sm font-bold uppercase transition-colors ${uncertaintyThreshold === 'HIGH' ? 'bg-brand-blue text-white shadow-sm border border-black' : 'text-gray-500 hover:text-black'}`}
              >
                Prudent
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col md:flex-row p-6 gap-8 max-w-7xl mx-auto w-full">
          {/* Left: Image & Controls */}
          <div className="flex-[2] flex flex-col justify-center space-y-6">
            <div className="relative aspect-square md:aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-retro border-4 border-black p-2 bg-white">
               <div className="w-full h-full border-2 border-black overflow-hidden relative">
                   <img 
                     src={TEST_3_IMAGES[test3Index].url} 
                     alt="Uncertainty Test" 
                     className="w-full h-full object-cover"
                     key={test3Index}
                   />
                   {test1Predictions.A && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in z-20">
                       <div className="text-white text-center p-6 border-2 border-white">
                          <p className="text-3xl font-black mb-2 uppercase">Résultat</p>
                          <p className="font-mono">Le Modèle B a su dire "Je ne sais pas".</p>
                       </div>
                     </div>
                   )}
               </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Button onClick={() => handleTest3Choice('PAS CHAT')} disabled={isAnalyzing || !!test1Predictions.A} variant="secondary" className="text-lg">PAS CHAT</Button>
              <Button onClick={() => handleTest3Choice('IDK')} disabled={isAnalyzing || !!test1Predictions.A} className="bg-brand-dark text-white hover:bg-black border-2 border-black text-lg">JE NE SAIS PAS</Button>
              <Button onClick={() => handleTest3Choice('CHAT')} disabled={isAnalyzing || !!test1Predictions.A} className="text-lg">CHAT</Button>
            </div>
          </div>

          {/* Right: AI Results */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="flex-1">
              <AICard model={MODEL_A} prediction={test1Predictions.A} loading={isAnalyzing} showUncertainty={true} />
            </div>
            <div className="flex-1">
              <AICard model={MODEL_B} prediction={test1Predictions.B} loading={isAnalyzing} showUncertainty={true} />
            </div>
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
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Le Modèle A répond toujours, quitte à dire n'importe quoi avec aplomb. Le Modèle B connaît ses limites et alerte l'humain en cas de doute.
          </p>
          
          <div className="bg-gray-50 p-6 rounded border-2 border-black text-left max-w-lg mx-auto shadow-sm">
             <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
               <span className="text-gray-500 font-mono uppercase text-sm">Erreurs commises (Modèle A)</span>
               <span className="font-black text-red-500 text-2xl">3</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-gray-500 font-mono uppercase text-sm">Abstentions (Modèle B)</span>
               <span className="font-black text-blue-500 text-2xl">3</span>
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
        <div className="absolute top-10 left-10 opacity-10 pointer-events-none transform -rotate-12">
            <Eye size={120} />
        </div>
        <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none transform rotate-12">
            <ShieldCheck size={120} />
        </div>
        <div className="w-full max-w-5xl bg-white border-4 border-black shadow-retro-lg p-6 md:p-10 relative z-10">
            <div className="absolute inset-0 pointer-events-none opacity-20 scanline z-0"></div>
            <div className="relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">Passeport de Certification</h2>
                    <p className="font-mono text-gray-600 text-sm md:text-base">Analyse terminée. Veuillez sélectionner le modèle le plus fiable.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-12">
                    {/* Model A Summary */}
                    <div className="bg-indigo-50 border-2 border-indigo-900 p-6 rounded-lg relative group hover:shadow-lg transition-shadow">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 font-bold font-mono text-sm uppercase tracking-widest border-2 border-black">
                            Modèle A
                        </div>
                        <div className="mt-4 space-y-6">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm uppercase flex items-center gap-1">
                                        Standard (Duel)
                                    </span>
                                    <span className="font-mono text-sm font-bold">98%</span>
                                </div>
                                <div className="w-full bg-indigo-200 h-4 border border-black rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full animate-fill" style={{ width: '98%' }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 italic">Performance sur images propres</p>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm uppercase flex items-center gap-1">
                                        Robustesse (Stress)
                                    </span>
                                    <span className="font-mono text-sm font-bold text-red-600">45%</span>
                                </div>
                                <div className="w-full bg-indigo-200 h-4 border border-black rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full animate-fill" style={{ width: '45%' }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 italic">Stabilité aux variations (flou, sombre)</p>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm uppercase flex items-center gap-1">
                                        Prudence (Incertitude)
                                    </span>
                                    <span className="font-mono text-sm font-bold text-red-600">20%</span>
                                </div>
                                <div className="w-full bg-indigo-200 h-4 border border-black rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full animate-fill" style={{ width: '20%' }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 italic">Capacité à dire "Je ne sais pas"</p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-center">
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 w-full border-2 border-black shadow-retro active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase tracking-wide flex items-center justify-center gap-2">
                                <Stamp size={18} />
                                Certifier IA A
                            </button>
                        </div>
                    </div>
                    
                    {/* Model B Summary */}
                    <div className="bg-pink-50 border-2 border-pink-900 p-6 rounded-lg relative group hover:shadow-lg transition-shadow">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-pink-600 text-white px-4 py-1 font-bold font-mono text-sm uppercase tracking-widest border-2 border-black">
                            Modèle B
                        </div>
                        <div className="mt-4 space-y-6">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm uppercase flex items-center gap-1">
                                        Standard (Duel)
                                    </span>
                                    <span className="font-mono text-sm font-bold">94%</span>
                                </div>
                                <div className="w-full bg-pink-200 h-4 border border-black rounded-full overflow-hidden">
                                    <div className="bg-pink-500 h-full animate-fill" style={{ width: '94%' }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 italic">Performance sur images propres</p>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm uppercase flex items-center gap-1">
                                        Robustesse (Stress)
                                    </span>
                                    <span className="font-mono text-sm font-bold text-green-700">88%</span>
                                </div>
                                <div className="w-full bg-pink-200 h-4 border border-black rounded-full overflow-hidden">
                                    <div className="bg-pink-500 h-full animate-fill" style={{ width: '88%' }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 italic">Stabilité aux variations (flou, sombre)</p>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm uppercase flex items-center gap-1">
                                        Prudence (Incertitude)
                                    </span>
                                    <span className="font-mono text-sm font-bold text-green-700">92%</span>
                                </div>
                                <div className="w-full bg-pink-200 h-4 border border-black rounded-full overflow-hidden">
                                    <div className="bg-pink-500 h-full animate-fill" style={{ width: '92%' }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 italic">Capacité à dire "Je ne sais pas"</p>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-center">
                            <button 
                                onClick={() => alert("Bravo ! Vous avez privilégié la fiabilité à la performance pure.")}
                                className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 w-full border-2 border-black shadow-retro active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase tracking-wide flex items-center justify-center gap-2"
                            >
                                <Stamp size={18} />
                                Certifier IA B
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t-4 border-dashed border-gray-300 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <h3 className="font-black text-lg uppercase mb-4 flex items-center gap-2 text-gray-800">
                                <ShieldCheck size={24} />
                                3 Règles à emporter
                            </h3>
                            <ul className="space-y-3 font-mono text-sm text-gray-700">
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 border-2 border-black flex items-center justify-center bg-yellow-300 flex-shrink-0">
                                        <span className="font-bold text-xs">✓</span>
                                    </div>
                                    <span>Toujours tester hors cas faciles.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 border-2 border-black flex items-center justify-center bg-yellow-300 flex-shrink-0">
                                        <span className="font-bold text-xs">✓</span>
                                    </div>
                                    <span>Regarder la stabilité aux variations.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 border-2 border-black flex items-center justify-center bg-yellow-300 flex-shrink-0">
                                        <span className="font-bold text-xs">✓</span>
                                    </div>
                                    <span>Savoir gérer l’incertitude.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="w-full md:w-auto mt-4 md:mt-0">
                            <button 
                                onClick={() => {
                                    setStage('WELCOME');
                                    setTest1Index(0);
                                    setTest2Index(0);
                                    setTest3Index(0);
                                    setStressState({blurLevel: 0, darkLevel: 0, cropLevel: 0});
                                }}
                                className="w-full md:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-8 border-2 border-black shadow-retro active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase text-sm flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Recommencer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return <div>Error: Unknown Stage</div>;
};

export default App;