export type ScreenStage =
  | 'WELCOME'
  | 'INTRO_EXPLAINER'
  | 'LAB_TRAINER'
  | 'BRIEFING'
  | 'TEST_1_DUEL'
  | 'RESULT_1'
  | 'TEST_2_STRESS'
  | 'RESULT_2'
  | 'TEST_3_UNCERTAINTY'
  | 'RESULT_3'
  | 'CONCLUSION'
  | 'BONUS_MENU'
  | 'BONUS_A1'
  | 'BONUS_A2'
  | 'BONUS_A3'
  | 'BONUS_B'
  | 'BONUS_C_INTRO'
  | 'BONUS_C_SELECTION'
  | 'BONUS_C_DIAGNOSE'
  | 'BONUS_C_KIT'
  | 'BONUS_C_RESULT';

export interface AIModel {
  id: 'A' | 'B';
  name: string;
  type: string;
  description: string;
  color: string;
  avatar: string;
}

export interface ActivityImage {
  id: string;
  url: string;
  truth: string; // ground truth label from backend
}

export interface StressState {
  blurLevel: number;
  darkLevel: number;
  cropLevel: number;
}

export interface Prediction {
  label: 'CHAT' | 'PAS_CHAT' | 'INCERTAIN';
  confidence: number;
  stability?: 'STABLE' | 'FRAGILE' | 'CASSE';
}

// Scores tracked across all tests
export interface TestScores {
  humanCorrect: number;
  humanTotal: number;
  modelACorrect: number;
  modelATotal: number;
  modelBCorrect: number;
  modelBTotal: number;
}

export interface StressResult {
  modelAStability: ('STABLE' | 'FRAGILE' | 'CASSE')[];
  modelBStability: ('STABLE' | 'FRAGILE' | 'CASSE')[];
}

export interface UncertaintyResult {
  modelAOverconfidentErrors: number;
  modelBAbstentions: number;
  modelATotal: number;
  modelBTotal: number;
}
