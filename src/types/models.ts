/**
 * Core data models - SoloRPG Leader (nation leadership narrative)
 */

export type Difficulty = 'easy' | 'normal' | 'hard';

/** Political axes: -100 to +100. Each decision shifts these values. */
export interface PoliticalAxes {
  economic: number;    // -100 (esquerda/intervenção) a +100 (direita/mercado livre)
  social: number;      // -100 (conservador) a +100 (progressista)
  governance: number;  // -100 (democrata) a +100 (ditador)
  military: number;    // -100 (civil/pacifista) a +100 (militarista)
  diplomatic: number;  // -100 (isolacionista) a +100 (internacionalista)
}

/** Impact of a single decision on political axes */
export interface DecisionImpact {
  economic?: number;
  social?: number;
  governance?: number;
  military?: number;
  diplomatic?: number;
}

/** Nation well-being indicators (0–100). Each decision affects these. */
export interface NationState {
  stability: number;      // Political/social stability
  economy: number;        // Economic health
  wellbeing: number;      // Social welfare, health, education
  inequality: number;     // Lower = less inequality, higher = more
  internationalStanding: number;  // Reputation abroad
}

/** Impact of a decision on nation state (deltas) */
export interface NationStateImpact {
  stability?: number;
  economy?: number;
  wellbeing?: number;
  inequality?: number;
  internationalStanding?: number;
}

export interface Campaign {
  id: string;
  title: string;
  nation: string;
  era?: string;
  system?: string; // Legacy: "Reign" or scenario type
  theme: string;
  tone: string;
  difficulty?: Difficulty;
  notes?: string;
  status?: 'active' | 'ended';
  createdAt: number;
  updatedAt: number;
}

export type MessageRole = 'user' | 'ai' | 'system';

export interface Message {
  id: string;
  campaignId: string;
  role: MessageRole;
  content: string;
  createdAt: number;
}

export interface Recap {
  campaignId: string;
  summaryShort: string;
  updatedAt: number;
}

export type EntityType = 'country' | 'organization' | 'politician' | 'faction' | 'institution' | 'other' | 'character' | 'npc' | 'suspect' | 'investigator' | 'place' | 'evidence';

/** Relation of entity to the player/leader: ally, internal enemy, external enemy */
export type EntityRelation = 'ally' | 'internal_enemy' | 'external_enemy' | 'neutral';

export interface Entity {
  id: string;
  campaignId: string;
  name: string;
  type: EntityType;
  /** Relation to the leader: ally (friend), internal enemy, external enemy, or neutral */
  relation?: EntityRelation;
  blurb: string;
  lastSeenAt: number;
}

export interface Fact {
  id: string;
  campaignId: string;
  subjectEntityId?: string;
  predicate: string;
  object: string;
  sourceMessageId: string;
  createdAt: number;
}

export interface Roll {
  id: string;
  campaignId: string;
  notation: string;
  result: number;
  breakdown: string;
  createdAt: number;
}

export interface SuggestedAction {
  id: string;
  label: string;
  action: string;
  rollNotation?: string;
  dc?: number;
}

/** Leader profile - replaces Character. Tracks political axes and nation state. */
export interface Leader {
  id: string;
  campaignId: string;
  name: string;
  title?: string;
  politicalAxes: PoliticalAxes;
  nationState?: NationState;
  lastImpact?: DecisionImpact;
  lastNationImpact?: NationStateImpact;
  lastDecisionSummary?: string;
  backstory?: string;
  goals?: string;
  createdAt: number;
  updatedAt: number;
}

/** Timeline event type - marks key moments in the mandate journey */
export type TimelineEventType = 'decision' | 'election_held' | 'election_postponed' | 'milestone' | 'crisis';

export interface TimelineEvent {
  id: string;
  campaignId: string;
  type: TimelineEventType;
  label: string;
  summary?: string;
  impactSummary?: string;
  createdAt: number;
}

/** Legacy Character - kept for compatibility during migration, can be removed */
export interface Character {
  id: string;
  campaignId: string;
  name: string;
  level: number;
  experience: number;
  attributes: Record<string, number>;
  hitPoints: number;
  maxHitPoints: number;
  backstory?: string;
  personality?: string;
  goals?: string;
  fears?: string;
  inventory?: InventoryItem[];
  equippedWeapon?: string;
  equippedArmor?: string;
  createdAt: number;
  updatedAt: number;
}

export type ItemType = 'consumable' | 'equipment' | 'other';

export interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
  type: ItemType;
  quantity: number;
  effect?: string;
  description?: string;
}

export type NewCampaign = Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>;
export type NewMessage = Omit<Message, 'id' | 'createdAt'>;
export type NewEntity = Omit<Entity, 'id' | 'lastSeenAt'>;
export type NewFact = Omit<Fact, 'id' | 'createdAt'>;
export type NewRoll = Omit<Roll, 'id' | 'createdAt'>;
export type NewLeader = Omit<Leader, 'id' | 'createdAt' | 'updatedAt'>;
export type NewTimelineEvent = Omit<TimelineEvent, 'id' | 'createdAt'>;
export type NewCharacter = Omit<Character, 'id' | 'createdAt' | 'updatedAt'>;
