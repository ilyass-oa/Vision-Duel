export type ScreenStage = 
  | 'WELCOME'
  | 'BRIEFING'
  | 'TEST_1_DUEL'
  | 'RESULT_1'
  | 'TEST_2_STRESS'
  | 'RESULT_2'
  | 'TEST_3_UNCERTAINTY'
  | 'RESULT_3'
  | 'CERTIFICATION';

export interface AIModel {
  id: 'A' | 'B';
  name: string;
  type: 'Spécialiste' | 'Robuste';
  description: string;
  color: string;
  avatar: string; // Emoji or icon code
}

export interface TestImage {
  id: number;
  url: string;
  truth: 'CHAT' | 'PAS CHAT';
  isAmbiguous?: boolean;
}

export interface StressState {
  blurLevel: number;
  darkLevel: number;
  cropLevel: number;
}

export interface Prediction {
  label: 'CHAT' | 'PAS CHAT' | 'INCERTAIN';
  confidence: number; // 0-100
  isStable?: boolean; // For stress test
}