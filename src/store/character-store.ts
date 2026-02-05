import { create } from 'zustand';
import type { Character, NewCharacter } from '../types/models';
import * as characterRepo from '../services/storage/character-repo';
import { migrateLegacyAttributes, needsAttributeMigration } from '../services/game/universal-attributes';

interface CharacterStore {
  character: Character | null;
  loading: boolean;
  error: string | null;

  loadCharacter: (campaignId: string) => Promise<void>;
  createCharacter: (data: NewCharacter) => Promise<Character>;
  setCharacter: (character: Character | null) => void;
  addExperience: (xp: number) => Promise<void>;

  takeDamage: (damage: number) => Promise<void>;
  heal: (amount: number) => Promise<void>;
  fullRest: () => Promise<void>;

  updateInventory: (inventory: import('../types/models').InventoryItem[]) => Promise<void>;
  useItem: (itemId: string) => Promise<boolean>;
  equipItem: (itemId: string, slot: 'weapon' | 'armor') => Promise<void>;
  unequipItem: (slot: 'weapon' | 'armor') => Promise<void>;

  clearCharacter: () => void;
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  character: null,
  loading: false,
  error: null,

  loadCharacter: async (campaignId: string) => {
    set({ loading: true, error: null });
    try {
      let character = await characterRepo.getCharacterByCampaign(campaignId);

      if (character && needsAttributeMigration(character.attributes)) {
        const migratedAttributes = migrateLegacyAttributes(character.attributes);
        character = await characterRepo.updateCharacter(character.id, { attributes: migratedAttributes });
      }

      if (character && character.inventory === undefined) {
        character = await characterRepo.updateCharacter(character.id, { inventory: [] });
      }

      set({ character, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  createCharacter: async (data: NewCharacter) => {
    set({ loading: true, error: null });
    try {
      const character = await characterRepo.createCharacter(data);
      set({ character, loading: false });
      return character;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  setCharacter: (character: Character | null) => set({ character }),

  addExperience: async (xp: number) => {
    const { character } = get();
    if (!character) return;
    const newXP = Math.max(0, character.experience + xp);
    const updated = await characterRepo.updateCharacter(character.id, { experience: newXP });
    set({ character: updated });
  },

  takeDamage: async (damage: number) => {
    const { character } = get();
    if (!character) throw new Error('No character loaded');
    const newHP = Math.max(0, character.hitPoints - damage);
    const updated = await characterRepo.updateCharacterHP(character.id, newHP);
    set({ character: updated });
  },

  heal: async (amount: number) => {
    const { character } = get();
    if (!character) throw new Error('No character loaded');
    const newHP = Math.min(character.maxHitPoints, character.hitPoints + amount);
    const updated = await characterRepo.updateCharacterHP(character.id, newHP);
    set({ character: updated });
  },

  fullRest: async () => {
    const { character } = get();
    if (!character) throw new Error('No character loaded');
    const updated = await characterRepo.updateCharacterHP(character.id, character.maxHitPoints);
    set({ character: updated });
  },

  updateInventory: async (inventory: import('../types/models').InventoryItem[]) => {
    const { character } = get();
    if (!character) throw new Error('No character loaded');
    const updated = await characterRepo.updateCharacter(character.id, { inventory });
    set({ character: updated });
  },

  useItem: async (itemId: string) => {
    const { character } = get();
    if (!character?.inventory) return false;
    const item = character.inventory.find((i) => i.id === itemId);
    if (!item || item.type !== 'consumable' || item.quantity < 1) return false;
    const { parseItemEffect } = await import('../services/game/inventory');
    const effect = parseItemEffect(item.effect || '');
    if (effect?.type === 'heal' && effect.value) await get().heal(effect.value);
    const newInventory = character.inventory
      .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
      .filter((i) => i.quantity > 0);
    const updated = await characterRepo.updateCharacter(character.id, { inventory: newInventory });
    set({ character: updated });
    return true;
  },

  equipItem: async (itemId: string, slot: 'weapon' | 'armor') => {
    const { character } = get();
    if (!character?.inventory) return;
    if (!character.inventory.some((i) => i.itemId === itemId)) return;
    const { getItemDefinition } = await import('../services/game/inventory');
    const def = getItemDefinition(itemId);
    if (!def?.equipmentSlot || def.equipmentSlot !== slot) return;
    const updates = slot === 'weapon' ? { equippedWeapon: itemId } : { equippedArmor: itemId };
    const updated = await characterRepo.updateCharacter(character.id, updates);
    set({ character: updated });
  },

  unequipItem: async (slot: 'weapon' | 'armor') => {
    const { character } = get();
    if (!character) return;
    const updates = slot === 'weapon' ? { equippedWeapon: undefined } : { equippedArmor: undefined };
    const updated = await characterRepo.updateCharacter(character.id, updates);
    set({ character: updated });
  },

  clearCharacter: () => set({ character: null, error: null }),
}));
