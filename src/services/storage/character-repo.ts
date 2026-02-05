import { getDB } from './db';
import { generateId } from '../../utils/id';
import type { Character, NewCharacter } from '../../types/models';

export async function getCharacterById(id: string): Promise<Character | undefined> {
  const db = await getDB();
  return await db.get('characters', id);
}

export async function getCharacterByCampaign(campaignId: string): Promise<Character | undefined> {
  const db = await getDB();
  const characters = await db.getAllFromIndex('characters', 'campaignId', campaignId);
  return characters[0];
}

export async function createCharacter(data: NewCharacter): Promise<Character> {
  const db = await getDB();
  const existing = await getCharacterByCampaign(data.campaignId);
  if (existing) throw new Error(`Character already exists for campaign ${data.campaignId}`);

  const now = Date.now();
  const character: Character = { id: generateId(), ...data, createdAt: now, updatedAt: now };
  await db.add('characters', character);
  return character;
}

export async function updateCharacter(
  id: string,
  updates: Partial<Omit<Character, 'id' | 'campaignId' | 'createdAt'>>
): Promise<Character> {
  const db = await getDB();
  const existing = await db.get('characters', id);
  if (!existing) throw new Error(`Character ${id} not found`);

  const updated = { ...existing, ...updates, updatedAt: Date.now() };
  await db.put('characters', updated);
  return updated;
}

export async function updateCharacterHP(id: string, hitPoints: number): Promise<Character> {
  return updateCharacter(id, { hitPoints });
}

export async function deleteCharacter(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('characters', id);
}

export async function deleteCharactersByCampaign(campaignId: string): Promise<void> {
  const db = await getDB();
  const characters = await db.getAllFromIndex('characters', 'campaignId', campaignId);
  for (const c of characters) await db.delete('characters', c.id);
}
