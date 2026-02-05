/**
 * Mystery detective campaign presets
 */

import type { NewCampaign } from '../../types/models';

export interface PresetCampaignMeta {
  id: string;
  system: string;
  tag?: string;
}

export interface PresetCampaignResolved extends PresetCampaignMeta {
  title: string;
  theme: string;
  tone: string;
}

/** Convert resolved preset to NewCampaign for creation */
export function presetToNewCampaign(preset: PresetCampaignResolved): NewCampaign {
  return {
    title: preset.title,
    system: preset.system,
    theme: preset.theme,
    tone: preset.tone,
  };
}

export const PRESET_CAMPAIGNS: PresetCampaignMeta[] = [
  { id: '1', system: 'Detective', tag: 'christie' },
  { id: '2', system: 'Detective', tag: 'holmes' },
  { id: '3', system: 'Detective', tag: 'express' },
  { id: '4', system: 'Detective', tag: 'rural' },
  { id: '5', system: 'Detective', tag: 'noir' },
];
