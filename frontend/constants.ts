import { AIModel, TestImage } from './types';

export const MODEL_A: AIModel = {
  id: 'A',
  name: 'Modèle A',
  type: 'Spécialiste',
  description: 'Très performant sur des images standards et nettes.',
  color: 'bg-brand-blue',
  avatar: '⚡️'
};

export const MODEL_B: AIModel = {
  id: 'B',
  name: 'Modèle B',
  type: 'Robuste',
  description: 'Entraîné pour résister aux variations et admettre le doute.',
  color: 'bg-brand-orange',
  avatar: '🛡️'
};

// Mock images using placeholder service
export const TEST_1_IMAGES: TestImage[] = [
  { id: 1, url: 'https://picsum.photos/id/40/600/600', truth: 'CHAT' }, // Cat-like
  { id: 2, url: 'https://picsum.photos/id/1025/600/600', truth: 'PAS CHAT' }, // Dog
  { id: 3, url: 'https://picsum.photos/id/64/600/600', truth: 'PAS CHAT' }, // Portrait
  { id: 4, url: 'https://picsum.photos/id/65/600/600', truth: 'PAS CHAT' }, // Girl
  { id: 5, url: 'https://picsum.photos/id/219/600/600', truth: 'CHAT' }, // Tiger (Cat family)
];

export const TEST_2_IMAGES: TestImage[] = [
  { id: 101, url: 'https://picsum.photos/id/40/600/600', truth: 'CHAT' }, // Base cat
];

export const TEST_3_IMAGES: TestImage[] = [
  { id: 201, url: 'https://picsum.photos/id/169/600/600', truth: 'PAS CHAT', isAmbiguous: true }, // Ambiguous
  { id: 202, url: 'https://picsum.photos/id/237/600/600', truth: 'PAS CHAT', isAmbiguous: true }, // Dog (black)
  { id: 203, url: 'https://picsum.photos/id/1074/600/600', truth: 'CHAT', isAmbiguous: true }, // Lioness
];
