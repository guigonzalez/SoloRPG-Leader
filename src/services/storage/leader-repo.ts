import { getDB } from './db';
import { generateId } from '../../utils/id';
import type { Leader, NewLeader, PoliticalAxes, NationState, NationStateImpact } from '../../types/models';

const DEFAULT_AXES: PoliticalAxes = {
  economic: 0,
  social: 0,
  governance: 0,
  military: 0,
  diplomatic: 0,
};

const DEFAULT_NATION_STATE: NationState = {
  stability: 50,
  economy: 50,
  wellbeing: 50,
  inequality: 50,
  internationalStanding: 50,
};

export async function getLeaderByCampaign(campaignId: string): Promise<Leader | undefined> {
  const db = await getDB();
  const leaders = await db.getAllFromIndex('leaders', 'campaignId', campaignId);
  return leaders[0];
}

export async function createLeader(data: NewLeader): Promise<Leader> {
  const db = await getDB();
  const existing = await getLeaderByCampaign(data.campaignId);
  if (existing) throw new Error(`Leader already exists for campaign ${data.campaignId}`);

  const now = Date.now();
  const leader: Leader = {
    id: generateId(),
    ...data,
    politicalAxes: data.politicalAxes ?? { ...DEFAULT_AXES },
    nationState: data.nationState ?? { ...DEFAULT_NATION_STATE },
    createdAt: now,
    updatedAt: now,
  };
  await db.add('leaders', leader);
  return leader;
}

export async function updateLeader(
  id: string,
  updates: Partial<Omit<Leader, 'id' | 'campaignId' | 'createdAt'>>
): Promise<Leader> {
  const db = await getDB();
  const existing = await db.get('leaders', id);
  if (!existing) throw new Error(`Leader ${id} not found`);

  const updated = { ...existing, ...updates, updatedAt: Date.now() };
  await db.put('leaders', updated);
  return updated;
}

export async function applyDecisionImpact(
  campaignId: string,
  impact: { economic?: number; social?: number; governance?: number; military?: number; diplomatic?: number },
  opts?: { nationImpact?: NationStateImpact; summary?: string }
): Promise<Leader> {
  const leader = await getLeaderByCampaign(campaignId);
  if (!leader) throw new Error(`No leader for campaign ${campaignId}`);

  const axes = { ...leader.politicalAxes };
  if (impact.economic != null) axes.economic = clamp(axes.economic + impact.economic);
  if (impact.social != null) axes.social = clamp(axes.social + impact.social);
  if (impact.governance != null) axes.governance = clamp(axes.governance + impact.governance);
  if (impact.military != null) axes.military = clamp(axes.military + impact.military);
  if (impact.diplomatic != null) axes.diplomatic = clamp(axes.diplomatic + impact.diplomatic);

  let nationState = leader.nationState ?? { ...DEFAULT_NATION_STATE };
  const ni = opts?.nationImpact;
  if (ni) {
    nationState = { ...nationState };
    if (ni.stability != null) nationState.stability = clampNation(nationState.stability + ni.stability);
    if (ni.economy != null) nationState.economy = clampNation(nationState.economy + ni.economy);
    if (ni.wellbeing != null) nationState.wellbeing = clampNation(nationState.wellbeing + ni.wellbeing);
    if (ni.inequality != null) nationState.inequality = clampNation(nationState.inequality + ni.inequality);
    if (ni.internationalStanding != null) nationState.internationalStanding = clampNation(nationState.internationalStanding + ni.internationalStanding);
  }

  return updateLeader(leader.id, {
    politicalAxes: axes,
    nationState,
    lastImpact: Object.keys(impact).length > 0 ? impact : undefined,
    lastNationImpact: ni && Object.keys(ni).length > 0 ? ni : undefined,
    lastDecisionSummary: opts?.summary || undefined,
  });
}

function clampNation(v: number): number {
  return Math.max(0, Math.min(100, v));
}

function clamp(v: number): number {
  return Math.max(-100, Math.min(100, v));
}
