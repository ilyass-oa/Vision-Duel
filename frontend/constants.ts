import { AIModel } from './types';

export const MODEL_A: AIModel = {
  id: 'A',
  name: 'IA A',
  type: 'Specialiste',
  description: 'Tres performant sur des images standards et nettes.',
  color: 'bg-brand-blue',
  avatar: 'A'
};

export const MODEL_B: AIModel = {
  id: 'B',
  name: 'IA B',
  type: 'Robuste',
  description: 'Entraine pour resister aux variations et admettre le doute.',
  color: 'bg-brand-orange',
  avatar: 'B'
};

// Image counts per test phase
export const TEST_1_COUNT = 8;
export const TEST_2_COUNT = 3;
export const TEST_3_COUNT = 6;

// Uncertainty threshold for "INCERTAIN" label (confidence below this → abstain)
export const UNCERTAINTY_THRESHOLD = 70; // percent

// Pre-calculated training metrics from actual training runs
// Used in Bonus A (loss curve) and Bonus B (overfitting comparison)
export const TRAINING_METRICS = {
  // Model A loss curve (10 epochs) — from real training
  modelA_loss: [0.2226, 0.0908, 0.0591, 0.0401, 0.0140, 0.0048, 0.0048, 0.0041, 0.0145, 0.0122],
  modelA_train_acc: [90.77, 96.71, 98.02, 98.35, 99.51, 99.84, 100.0, 100.0, 99.84, 99.67],
  modelA_val_acc: [92.05, 96.03, 96.03, 95.36, 95.36, 97.35, 97.35, 96.69, 94.70, 97.35],
  // Model B loss curve (10 epochs) — from real training
  modelB_loss: [0.2708, 0.1095, 0.0646, 0.0313, 0.0092, 0.0203, 0.0623, 0.1275, 0.0202, 0.0124],
  modelB_train_acc: [89.10, 96.03, 98.39, 98.88, 99.88, 99.01, 98.51, 95.66, 99.50, 99.88],
  modelB_val_acc: [93.53, 95.52, 97.51, 98.01, 98.51, 95.52, 91.04, 94.53, 95.52, 95.52],
};
