import type {BodyZone, CalmSpeciesId, FeedSpeciesId, SpeciesId} from './types';

export interface ZoneCoord {
  zone: BodyZone;
  label: string;
  xPct: number;
  yPct: number;
}

export interface SpeciesDefinition<T extends SpeciesId = SpeciesId> {
  id: T;
  name: string;
  category: 'calm' | 'feed';
  accentColor: string;
  secondaryColor: string;
  angerLabel?: string;
  spriteUrl?: string;
  petZones?: readonly ZoneCoord[];
}

export const CALM_SPECIES: readonly SpeciesDefinition<CalmSpeciesId>[] = [
  {
    id: 'poochyena',
    name: 'Poochyena',
    category: 'calm',
    accentColor: '#5B5E6B',
    secondaryColor: '#D6C4A2',
    angerLabel: 'Menggeram & bulu berdiri',
    petZones: [
      {zone: 'head', label: 'Kepala', xPct: 38, yPct: 30},
      {zone: 'cheek', label: 'Pipi', xPct: 32, yPct: 48},
      {zone: 'back', label: 'Punggung', xPct: 58, yPct: 44},
      {zone: 'belly', label: 'Perut', xPct: 54, yPct: 68},
    ],
  },
  {
    id: 'numel',
    name: 'Numel',
    category: 'calm',
    accentColor: '#F3C73B',
    secondaryColor: '#7A5438',
    angerLabel: 'Punuk mengeluarkan uap panas',
    petZones: [
      {zone: 'head', label: 'Kepala', xPct: 33, yPct: 40},
      {zone: 'cheek', label: 'Pipi', xPct: 35, yPct: 56},
      {zone: 'back', label: 'Punuk', xPct: 57, yPct: 28},
      {zone: 'belly', label: 'Perut', xPct: 56, yPct: 66},
    ],
  },
  {
    id: 'electrike',
    name: 'Electrike',
    category: 'calm',
    accentColor: '#69C24B',
    secondaryColor: '#FFE047',
    angerLabel: 'Memercikkan bunga api listrik',
    petZones: [
      {zone: 'head', label: 'Kepala', xPct: 36, yPct: 28},
      {zone: 'cheek', label: 'Pipi', xPct: 34, yPct: 48},
      {zone: 'back', label: 'Punggung', xPct: 60, yPct: 46},
      {zone: 'belly', label: 'Perut', xPct: 54, yPct: 68},
    ],
  },
  {
    id: 'trapinch',
    name: 'Trapinch',
    category: 'calm',
    accentColor: '#EF7C33',
    secondaryColor: '#F7D294',
    angerLabel: 'Mengatupkan rahang besar',
    petZones: [
      {zone: 'head', label: 'Kepala', xPct: 45, yPct: 28},
      {zone: 'cheek', label: 'Pipi', xPct: 30, yPct: 46},
      {zone: 'back', label: 'Punggung', xPct: 68, yPct: 50},
      {zone: 'belly', label: 'Perut', xPct: 52, yPct: 68},
    ],
  },
  {
    id: 'aron',
    name: 'Aron',
    category: 'calm',
    accentColor: '#8B95A5',
    secondaryColor: '#3C4656',
    angerLabel: 'Menyeruduk ke udara',
    petZones: [
      {zone: 'head', label: 'Kepala', xPct: 42, yPct: 30},
      {zone: 'cheek', label: 'Pipi', xPct: 32, yPct: 50},
      {zone: 'back', label: 'Punggung', xPct: 62, yPct: 44},
      {zone: 'belly', label: 'Perut', xPct: 54, yPct: 68},
    ],
  },
  {
    id: 'torchic',
    name: 'Torchic',
    category: 'calm',
    accentColor: '#F27935',
    secondaryColor: '#FFD34E',
    angerLabel: 'Meniupkan bara api kecil',
    petZones: [
      {zone: 'head', label: 'Kepala', xPct: 48, yPct: 24},
      {zone: 'cheek', label: 'Pipi', xPct: 38, yPct: 40},
      {zone: 'back', label: 'Punggung', xPct: 62, yPct: 52},
      {zone: 'belly', label: 'Perut', xPct: 48, yPct: 66},
    ],
  },
  {
    id: 'mudkip',
    name: 'Mudkip',
    category: 'calm',
    accentColor: '#3B94E4',
    secondaryColor: '#F28B3C',
    angerLabel: 'Memercikkan lumpur',
    petZones: [
      {zone: 'head', label: 'Sirip Kepala', xPct: 44, yPct: 24},
      {zone: 'cheek', label: 'Pipi', xPct: 32, yPct: 46},
      {zone: 'back', label: 'Punggung', xPct: 62, yPct: 50},
      {zone: 'belly', label: 'Perut', xPct: 50, yPct: 68},
    ],
  },
  {
    id: 'treecko',
    name: 'Treecko',
    category: 'calm',
    accentColor: '#67C455',
    secondaryColor: '#D93B48',
    angerLabel: 'Mengibaskan ekor daun',
    petZones: [
      {zone: 'head', label: 'Kepala', xPct: 46, yPct: 24},
      {zone: 'cheek', label: 'Pipi', xPct: 36, yPct: 38},
      {zone: 'back', label: 'Ekor', xPct: 68, yPct: 56},
      {zone: 'belly', label: 'Perut', xPct: 48, yPct: 64},
    ],
  },
] as const;

export const FEED_SPECIES: readonly SpeciesDefinition<FeedSpeciesId>[] = [
  {
    id: 'zigzagoon',
    name: 'Zigzagoon',
    category: 'feed',
    accentColor: '#8A6343',
    secondaryColor: '#F3EAD3',
  },
  {
    id: 'wurmple',
    name: 'Wurmple',
    category: 'feed',
    accentColor: '#D94343',
    secondaryColor: '#F6E7B9',
  },
  {
    id: 'taillow',
    name: 'Taillow',
    category: 'feed',
    accentColor: '#25396B',
    secondaryColor: '#E0423B',
  },
  {
    id: 'shroomish',
    name: 'Shroomish',
    category: 'feed',
    accentColor: '#EFE4B8',
    secondaryColor: '#5FA748',
  },
  {
    id: 'skitty',
    name: 'Skitty',
    category: 'feed',
    accentColor: '#F08CA5',
    secondaryColor: '#F9E8C4',
  },
  {
    id: 'lotad',
    name: 'Lotad',
    category: 'feed',
    accentColor: '#3C7CD6',
    secondaryColor: '#65BA4A',
  },
  {
    id: 'seedot',
    name: 'Seedot',
    category: 'feed',
    accentColor: '#7A5436',
    secondaryColor: '#C9A574',
  },
  {
    id: 'azurill',
    name: 'Azurill',
    category: 'feed',
    accentColor: '#4BA4F0',
    secondaryColor: '#BFE4FF',
  },
] as const;

export function getCalmSpecies(id: CalmSpeciesId): SpeciesDefinition<CalmSpeciesId> {
  return CALM_SPECIES.find((s) => s.id === id) ?? CALM_SPECIES[0];
}

export function getRandomCalmSpecies(): SpeciesDefinition<CalmSpeciesId> {
  const index = Math.floor(Math.random() * CALM_SPECIES.length);
  return CALM_SPECIES[index];
}

export function pickRandomFeedRoster(count: number): SpeciesDefinition<FeedSpeciesId>[] {
  const pool = [...FEED_SPECIES];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = pool[i];
    pool[i] = pool[j];
    pool[j] = temp;
  }
  return pool.slice(0, Math.min(count, pool.length));
}

export function getSpeciesById(id: SpeciesId): SpeciesDefinition {
  const found =
    CALM_SPECIES.find((s) => s.id === id) ?? FEED_SPECIES.find((s) => s.id === id);
  return found ?? CALM_SPECIES[0];
}
