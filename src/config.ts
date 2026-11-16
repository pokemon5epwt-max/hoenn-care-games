export interface CalmStageConfig {
  stage: 1 | 2 | 3;
  name: string;
  totalCircles: number;
  approachMs: number;
  spacingMs: number;
  pairedSpawns: number;
  missPenalty: number;
  startCalm: number;
  threshold: number;
}

export const CHANNELS = {
  START: 'hoenn-care/start',
  RESULT: 'hoenn-care/result',
} as const;

export const GAME_WINDOW_ID = 'hoenn-care/game-window';

export const MODAL_SIZE = {
  width: 760,
  height: 580,
} as const;

export const CALM_CONFIG = {
  maxCalm: 100,
  minCalm: 0,
  perfectWindowMs: 80,
  goodWindowMs: 160,
  perfectGain: 4,
  goodGain: 2,
  minPairDistancePct: 22,
  stages: [
    {
      stage: 1,
      name: 'Kesal',
      totalCircles: 24,
      approachMs: 2025,
      spacingMs: 1215,
      pairedSpawns: 0,
      missPenalty: 5,
      startCalm: 30,
      threshold: 60,
    },
    {
      stage: 2,
      name: 'Marah',
      totalCircles: 32,
      approachMs: 1620,
      spacingMs: 945,
      pairedSpawns: 0,
      missPenalty: 6,
      startCalm: 25,
      threshold: 70,
    },
    {
      stage: 3,
      name: 'Mengamuk',
      totalCircles: 44,
      approachMs: 1280,
      spacingMs: 675,
      pairedSpawns: 10,
      missPenalty: 7,
      startCalm: 20,
      threshold: 80,
    },
  ] as readonly CalmStageConfig[],
} as const;

export const FEED_CONFIG = {
  defaultCount: 3,
  minCount: 1,
  maxCount: 6,
  bandWidths: [24, 18, 12] as readonly number[],
  bandMinFill: 25,
  bandMaxFill: 85,
  basePourRatePerSec: 20,
  pourAccelPerSec2: 44,
  spillThreshold: 100,
  eatAnimationMs: 1350,
} as const;
