/**
 * Onboarding campaign - create and manage the tutorial campaign
 */

import * as campaignRepo from '../storage/campaign-repo';
import { ONBOARDING_CAMPAIGN_ID } from './onboarding-content';
import type { Campaign } from '../../types/models';

/**
 * Get or create the onboarding campaign
 */
export async function getOrCreateOnboardingCampaign(): Promise<Campaign> {
  const existing = await campaignRepo.getCampaignById(ONBOARDING_CAMPAIGN_ID);
  if (existing) {
    return existing;
  }

  const now = Date.now();
  const campaign: Campaign = {
    id: ONBOARDING_CAMPAIGN_ID,
    title: 'Tutorial: The Blackwood Case',
    system: 'Onboarding',
    theme: 'A classic manor murder. Learn the mechanics.',
    tone: 'Tutorial, guided',
    difficulty: 'easy',
    createdAt: now,
    updatedAt: now,
  };

  await campaignRepo.createCampaignWithId(campaign);
  return campaign;
}

export function isOnboardingCampaign(campaign: Campaign | null): boolean {
  return campaign?.system === 'Onboarding' || campaign?.id === ONBOARDING_CAMPAIGN_ID;
}
