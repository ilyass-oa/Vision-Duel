import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AppProvider, useAppContext } from './context/AppContext';

// Screens
import { WelcomeScreen } from './screens/WelcomeScreen';
import { IntroExplainerScreen } from './screens/IntroExplainerScreen';
import { BriefingScreen } from './screens/BriefingScreen';
import { Test1DuelScreen } from './screens/Test1DuelScreen';
import { Result1Screen } from './screens/Result1Screen';
import { Test2StressScreen } from './screens/Test2StressScreen';
import { Result2Screen } from './screens/Result2Screen';
import { Test3UncertaintyScreen } from './screens/Test3UncertaintyScreen';
import { Result3Screen } from './screens/Result3Screen';
import { ConclusionScreen } from './screens/ConclusionScreen';
import { BonusMenuScreen } from './screens/BonusMenuScreen';
import { BonusA1Screen } from './screens/BonusA1Screen';
import { BonusA2Screen } from './screens/BonusA2Screen';
import { BonusA3Screen } from './screens/BonusA3Screen';
import { BonusBScreen } from './screens/BonusBScreen';
import { BonusCScreens } from './screens/BonusCScreens';
import { LabTrainerScreen } from './screens/LabTrainerScreen';

const MainRouter: React.FC = () => {
  const { stage, switchTest } = useAppContext();

  if (stage === 'WELCOME') return <WelcomeScreen />;
  if (stage === 'INTRO_EXPLAINER') return <IntroExplainerScreen />;
  if (stage === 'BRIEFING') return <BriefingScreen />;
  if (stage === 'TEST_1_DUEL') return <Test1DuelScreen />;
  if (stage === 'RESULT_1') return <Result1Screen />;
  if (stage === 'TEST_2_STRESS') return <Test2StressScreen />;
  if (stage === 'RESULT_2') return <Result2Screen />;
  if (stage === 'TEST_3_UNCERTAINTY') return <Test3UncertaintyScreen />;
  if (stage === 'RESULT_3') return <Result3Screen />;
  if (stage === 'CONCLUSION') return <ConclusionScreen />;

  if (stage === 'BONUS_MENU') return <BonusMenuScreen />;
  if (stage === 'BONUS_A1') return <BonusA1Screen />;
  if (stage === 'BONUS_A2') return <BonusA2Screen onNext={() => switchTest('BONUS_A3')} />;
  if (stage === 'BONUS_A3') return <BonusA3Screen />;
  if (stage === 'BONUS_B') return <BonusBScreen />;

  if (stage.startsWith('BONUS_C_')) return <BonusCScreens />;

  if (stage === 'LAB_TRAINER') return <LabTrainerScreen />;

  return <div className="min-h-screen flex items-center justify-center text-2xl font-mono text-red-500">Erreur : etape inconnue ({stage})</div>;
};

const GlobalQrCode: React.FC = () => {
  // @ts-ignore
  const tunnelUrl = import.meta.env.VITE_TUNNEL_URL;
  const hostname = window.location.hostname;
  const isLocalHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1';

  if (!tunnelUrl || !isLocalHost) return null;

  return (
    <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 bg-white p-3 md:p-4 rounded-xl border-4 border-black shadow-retro-sm z-50 flex flex-col items-center animate-fade-in text-brand-dark">
      <p className="text-[10px] md:text-xs font-mono font-black uppercase mb-2 text-center leading-tight">
        Jouer sur <br /> mobile
      </p>
      <QRCodeSVG value={tunnelUrl} size={90} className="border-2 border-gray-200 rounded p-1" />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainRouter />
      <GlobalQrCode />
    </AppProvider>
  );
};

export default App;
