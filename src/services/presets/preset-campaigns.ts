/**
 * Nation leadership campaign presets
 */

import type { NewCampaign } from '../../types/models';
import type { Difficulty } from '../../types/models';

export interface PresetCampaignMeta {
  id: string;
  nation: string;
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
    nation: preset.nation,
    theme: preset.theme,
    tone: preset.tone,
    difficulty: preset.difficulty ?? 'normal',
  };
}

/** Difficulty affects scenario complexity (not arrest attempts) */
export const MAX_ATTEMPTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 5,
  normal: 3,
  hard: 2,
};

export const PRESET_CAMPAIGNS: PresetCampaignMeta[] = [
  { id: '1', nation: 'República Democrática', tag: 'economic' },
  { id: '2', nation: 'Reino do Norte', tag: 'war' },
  { id: '3', nation: 'Federação Oriental', tag: 'pandemic' },
  { id: '4', nation: 'União dos Estados', tag: 'election' },
  { id: '5', nation: 'Império Meridional', tag: 'diplomatic' },
  { id: '6', nation: 'Confederação Central', tag: 'social' },
  { id: '7', nation: 'República do Sul', tag: 'military' },
  { id: '8', nation: 'Aliança Ocidental', tag: 'economic' },
  { id: '9', nation: 'Nação Insular', tag: 'diplomatic' },
  { id: '10', nation: 'República Democrática', tag: 'social' },
  { id: '11', nation: 'Reino do Norte', tag: 'election' },
  { id: '12', nation: 'Federação Oriental', tag: 'war' },
  { id: '13', nation: 'União dos Estados', tag: 'pandemic' },
  { id: '14', nation: 'Império Meridional', tag: 'economic' },
  { id: '15', nation: 'Confederação Central', tag: 'diplomatic' },
  { id: '16', nation: 'República do Sul', tag: 'social' },
  { id: '17', nation: 'Aliança Ocidental', tag: 'military' },
  { id: '18', nation: 'Nação Insular', tag: 'election' },
  { id: '19', nation: 'República Democrática', tag: 'war' },
  { id: '20', nation: 'Reino do Norte', tag: 'pandemic' },
];
