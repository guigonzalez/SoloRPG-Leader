/**
 * Mystery detective campaign presets
 */

import type { NewCampaign } from '../../types/models';
import type { Difficulty } from '../../types/models';

export interface PresetCampaignMeta {
  id: string;
  system: string;
  tag?: string;
}

export interface PresetCampaignResolved extends PresetCampaignMeta {
  title: string;
  theme: string;
  tone: string;
  difficulty?: Difficulty;
}

/** Convert resolved preset to NewCampaign for creation */
export function presetToNewCampaign(preset: PresetCampaignResolved): NewCampaign {
  return {
    title: preset.title,
    system: preset.system,
    theme: preset.theme,
    tone: preset.tone,
    difficulty: preset.difficulty ?? 'normal',
  };
}

/** Max arrest attempts by difficulty */
export const MAX_ATTEMPTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 5,
  normal: 3,
  hard: 2,
};

export const PRESET_CAMPAIGNS: PresetCampaignMeta[] = [
  { id: '1', system: 'Detective', tag: 'christie' },
  { id: '2', system: 'Detective', tag: 'holmes' },
  { id: '3', system: 'Detective', tag: 'express' },
  { id: '4', system: 'Detective', tag: 'rural' },
  { id: '5', system: 'Detective', tag: 'noir' },
  { id: '6', system: 'Detective', tag: 'cozy' },
  { id: '7', system: 'Detective', tag: 'spy' },
  { id: '8', system: 'Detective', tag: 'supernatural' },
  { id: '9', system: 'Detective', tag: 'historical' },
  { id: '10', system: 'Detective', tag: 'locked' },
  { id: '11', system: 'Detective', tag: 'heist' },
  { id: '12', system: 'Detective', tag: 'cozy' },
  { id: '13', system: 'Detective', tag: 'spy' },
  { id: '14', system: 'Detective', tag: 'supernatural' },
  { id: '15', system: 'Detective', tag: 'historical' },
  { id: '16', system: 'Detective', tag: 'noir' },
  { id: '17', system: 'Detective', tag: 'christie' },
  { id: '18', system: 'Detective', tag: 'holmes' },
  { id: '19', system: 'Detective', tag: 'express' },
  { id: '20', system: 'Detective', tag: 'rural' },
];
