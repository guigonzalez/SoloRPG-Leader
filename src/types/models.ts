/**
 * Core data models - SoloRPG Detective (investigative narrative)
 */

export interface MysteryAnswer {
  campaignId: string;
  criminal: string;
  weapon: string;
  motive: string;
  attemptsUsed: number; // Wrong arrests (max 3)
  createdAt: number;
}

export interface SolvedAnswer {
  criminal: string;
  weapon: string;
  motive: string;
}

export interface Campaign {
  id: string;
  title: string;
  system: string;
  theme: string;
  tone: string;
  notes?: string;
  status?: 'active' | 'solved' | 'failed';
  solvedAnswer?: SolvedAnswer;
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

export type EntityType = 'suspect' | 'investigator' | 'place' | 'evidence' | 'faction' | 'other' | 'character' | 'npc' | 'item';

export interface Entity {
  id: string;
  campaignId: string;
  name: string;
  type: EntityType;
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
export type NewCharacter = Omit<Character, 'id' | 'createdAt' | 'updatedAt'>;
