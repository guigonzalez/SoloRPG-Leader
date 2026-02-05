/**
 * Inventory system - items, effects, and definitions
 */

import { generateId } from '../../utils/id';
import type { InventoryItem, ItemType } from '../../types/models';
import { getSettings } from '../storage/settings-storage';
import { translations, type Language } from '../i18n/translations';
import { getSheetPreset } from './sheet-presets';

/** 'starting' = selectable at creation + droppable | 'drop-only' = droppable during gameplay only */
export type ItemAvailability = 'starting' | 'drop-only';

/**
 * Item definition (template) - used for creation and drops
 */
export interface ItemDefinition {
  id: string;
  name: string;
  type: ItemType;
  effect?: string;
  description: string;
  defaultQuantity?: number;
  equipmentSlot?: 'weapon' | 'armor';
  /** Genre tags: 'fantasy', 'horror', 'cyberpunk', 'generic', etc. */
  tags: string[];
  /** 'starting' = creation + drops | 'drop-only' = drops only */
  availability: ItemAvailability;
}

/**
 * Single catalog of all built-in items
 */
export const ITEM_CATALOG: ItemDefinition[] = [
  { id: 'healing_potion', name: 'Healing Potion', type: 'consumable', effect: 'heal:10', description: 'Restores 10 HP when used', defaultQuantity: 2, tags: ['fantasy', 'generic'], availability: 'starting' },
  { id: 'lesser_healing_potion', name: 'Lesser Healing Potion', type: 'consumable', effect: 'heal:5', description: 'Restores 5 HP when used', defaultQuantity: 3, tags: ['fantasy', 'generic'], availability: 'starting' },
  { id: 'rope', name: 'Rope (50ft)', type: 'equipment', effect: 'roll_bonus:1', description: '+1 to agility rolls when climbing or tying', defaultQuantity: 1, tags: ['fantasy', 'generic'], availability: 'starting' },
  { id: 'lucky_charm', name: 'Lucky Charm', type: 'equipment', effect: 'roll_bonus:1', description: '+1 to any roll (narrative luck)', defaultQuantity: 1, tags: ['fantasy', 'gothic', 'generic'], availability: 'starting' },
  { id: 'iron_rations', name: 'Iron Rations', type: 'consumable', description: 'One day of food. No mechanical effect.', defaultQuantity: 5, tags: ['fantasy', 'generic'], availability: 'starting' },
  { id: 'torch', name: 'Torch', type: 'consumable', description: 'Light source. No mechanical effect.', defaultQuantity: 3, tags: ['fantasy', 'horror', 'gothic', 'generic'], availability: 'starting' },
  { id: 'thieves_tools', name: "Thieves' Tools", type: 'equipment', effect: 'roll_bonus:2', description: '+2 to agility rolls when picking locks or disarming traps', defaultQuantity: 1, tags: ['fantasy', 'generic'], availability: 'starting' },
  { id: 'shield', name: 'Shield', type: 'equipment', effect: 'roll_bonus:1', description: '+1 to agility rolls when defending', defaultQuantity: 1, tags: ['fantasy', 'gothic', 'generic'], availability: 'starting' },
  { id: 'shortsword', name: 'Shortsword', type: 'equipment', effect: 'damage_bonus:2', equipmentSlot: 'weapon', description: '+2 to damage rolls in combat', defaultQuantity: 1, tags: ['fantasy', 'gothic', 'generic'], availability: 'starting' },
  { id: 'dagger', name: 'Dagger', type: 'equipment', effect: 'damage_bonus:1', equipmentSlot: 'weapon', description: '+1 to damage rolls', defaultQuantity: 1, tags: ['fantasy', 'gothic', 'horror', 'generic'], availability: 'starting' },
  { id: 'staff', name: 'Staff', type: 'equipment', effect: 'damage_bonus:1', equipmentSlot: 'weapon', description: '+1 to damage rolls', defaultQuantity: 1, tags: ['fantasy', 'generic'], availability: 'starting' },
  { id: 'leather_armor', name: 'Leather Armor', type: 'equipment', effect: 'damage_reduction:2', equipmentSlot: 'armor', description: 'Reduces incoming damage by 2', defaultQuantity: 1, tags: ['fantasy', 'gothic', 'generic'], availability: 'starting' },
  { id: 'chainmail', name: 'Chainmail', type: 'equipment', effect: 'damage_reduction:4', equipmentSlot: 'armor', description: 'Reduces incoming damage by 4', defaultQuantity: 1, tags: ['fantasy', 'gothic'], availability: 'starting' },
  { id: 'greater_healing_potion', name: 'Greater Healing Potion', type: 'consumable', effect: 'heal:20', description: 'Restores 20 HP when used', defaultQuantity: 1, tags: ['fantasy', 'generic'], availability: 'drop-only' },
  { id: 'magic_sword', name: 'Magic Sword', type: 'equipment', effect: 'roll_bonus:2,damage_bonus:3', equipmentSlot: 'weapon', description: '+2 to attack rolls, +3 to damage', defaultQuantity: 1, tags: ['fantasy'], availability: 'drop-only' },
  { id: 'plate_armor', name: 'Plate Armor', type: 'equipment', effect: 'damage_reduction:6', equipmentSlot: 'armor', description: 'Heavy armor, reduces damage by 6', defaultQuantity: 1, tags: ['fantasy'], availability: 'drop-only' },
  { id: 'amulet_protection', name: 'Amulet of Protection', type: 'equipment', effect: 'roll_bonus:1', description: '+1 to any defensive roll', defaultQuantity: 1, tags: ['fantasy', 'gothic', 'horror', 'generic'], availability: 'starting' },
  { id: 'gold_coins', name: 'Gold Coins', type: 'other', description: 'Currency. Narrative use only.', defaultQuantity: 10, tags: ['fantasy', 'gothic', 'generic'], availability: 'starting' },
  { id: 'revolver', name: 'Revolver', type: 'equipment', effect: 'roll_bonus:1,damage_bonus:2', equipmentSlot: 'weapon', description: 'Reliable sidearm favored by investigators and lawmen.', defaultQuantity: 1, tags: ['horror', 'modern', 'generic'], availability: 'starting' },
  { id: 'flashlight', name: 'Flashlight', type: 'equipment', effect: 'roll_bonus:1', description: '+1 to mind or agility rolls when exploring dark places.', defaultQuantity: 1, tags: ['horror', 'modern', 'generic'], availability: 'starting' },
  { id: 'med_kit', name: 'Med-Kit', type: 'consumable', effect: 'heal:15', description: 'Portable medical kit that restores 15 HP in the field.', defaultQuantity: 1, tags: ['horror', 'modern', 'scifi', 'cyberpunk'], availability: 'starting' },
  { id: 'laser_pistol', name: 'Laser Pistol', type: 'equipment', effect: 'roll_bonus:1,damage_bonus:3', equipmentSlot: 'weapon', description: 'Compact energy weapon favored in high-tech societies.', defaultQuantity: 1, tags: ['scifi', 'cyberpunk'], availability: 'drop-only' },
  { id: 'energy_shield', name: 'Energy Shield', type: 'equipment', effect: 'damage_reduction:4', equipmentSlot: 'armor', description: 'Projected barrier that reduces incoming damage by 4.', defaultQuantity: 1, tags: ['scifi', 'cyberpunk'], availability: 'drop-only' },
  { id: 'hacking_rig', name: 'Hacking Rig', type: 'equipment', effect: 'roll_bonus:2', description: '+2 to mind rolls when hacking systems or bypassing digital security.', defaultQuantity: 1, tags: ['cyberpunk'], availability: 'starting' },
];

/**
 * Get localized display name for an item id
 */
export function getItemDisplayName(itemId: string, fallbackName: string, language?: Language): string {
  const lang = (language || getSettings().language || 'en') as Language;
  const t = translations[lang] || translations.en;
  return t.itemNames[itemId] || fallbackName;
}

/**
 * Get items for a preset. Single entry point for both creation and AI drops.
 * @param presetId - Campaign system or preset ID (e.g. 'dnd-fantasy', 'D&D 5e')
 * @param options.startingOnly - If true, only items with availability 'starting'
 */
export function getItemsForPreset(
  presetId: string,
  options?: { startingOnly?: boolean }
): ItemDefinition[] {
  const preset = getSheetPreset(presetId);
  const allowedTags = preset.itemTags || ['generic'];

  return ITEM_CATALOG.filter((item) => {
    const itemTags = item.tags?.length ? item.tags : ['generic'];
    const tagMatch = itemTags.some((t) => allowedTags.includes(t));
    if (!tagMatch) return false;
    if (options?.startingOnly) return item.availability === 'starting';
    return true;
  });
}

export function getAllItemDefinitions(): ItemDefinition[] {
  return [...ITEM_CATALOG];
}

export function getItemDefinition(itemId: string): ItemDefinition | undefined {
  return getAllItemDefinitions().find((i) => i.id === itemId);
}

/**
 * Create an inventory item from definition
 */
export function createInventoryItem(itemId: string, quantity: number = 1): InventoryItem | null {
  const def = getItemDefinition(itemId);
  if (!def) return null;
  const qty = quantity > 0 ? quantity : def.defaultQuantity ?? 1;
  return {
    id: generateId(),
    itemId: def.id,
    name: def.name,
    type: def.type,
    quantity: qty,
    effect: def.effect,
    description: def.description,
  };
}

export function parseItemEffect(effect: string): { type: string; value?: number; attr?: string } | null {
  if (!effect) return null;
  const [type, ...rest] = effect.split(':');
  if (type === 'heal') return { type: 'heal', value: parseInt(rest[0], 10) };
  if (type === 'roll_bonus') return { type: 'roll_bonus', value: parseInt(rest[0], 10) };
  if (type === 'modifier') return { type: 'modifier', attr: rest[0], value: parseInt(rest[1], 10) };
  if (type === 'damage_bonus') return { type: 'damage_bonus', value: parseInt(rest[0], 10) };
  if (type === 'damage_reduction') return { type: 'damage_reduction', value: parseInt(rest[0], 10) };
  return null;
}

export function parseAllEffects(effect: string): Array<{ type: string; value?: number; attr?: string }> {
  if (!effect) return [];
  return effect.split(',').map((e) => parseItemEffect(e.trim())).filter((p): p is NonNullable<typeof p> => p !== null);
}

export function formatEquipmentEffects(effect: string | undefined): string[] {
  if (!effect) return [];
  const results: string[] = [];
  for (const parsed of parseAllEffects(effect)) {
    if (parsed.type === 'damage_bonus' && parsed.value) results.push(`+${parsed.value} damage`);
    else if (parsed.type === 'damage_reduction' && parsed.value) results.push(`-${parsed.value} damage taken`);
    else if (parsed.type === 'roll_bonus' && parsed.value) results.push(`+${parsed.value} to rolls`);
    else if (parsed.type === 'modifier' && parsed.attr && parsed.value) results.push(`+${parsed.value} ${parsed.attr.charAt(0).toUpperCase() + parsed.attr.slice(1)}`);
  }
  return results;
}

export function getArmorDamageReduction(equippedArmorId: string | undefined, inventory: InventoryItem[] | undefined): number {
  if (!equippedArmorId || !inventory) return 0;
  const item = inventory.find((i) => i.itemId === equippedArmorId);
  if (!item?.effect) return 0;
  for (const parsed of parseAllEffects(item.effect)) {
    if (parsed.type === 'damage_reduction' && parsed.value) return parsed.value;
  }
  return 0;
}

export function getWeaponDamageBonus(equippedWeaponId: string | undefined, inventory: InventoryItem[] | undefined): number {
  if (!equippedWeaponId || !inventory) return 0;
  const item = inventory.find((i) => i.itemId === equippedWeaponId);
  if (!item?.effect) return 0;
  for (const parsed of parseAllEffects(item.effect)) {
    if (parsed.type === 'damage_bonus' && parsed.value) return parsed.value;
  }
  return 0;
}

export function getEquipmentRollBonus(inventory: InventoryItem[] | undefined): number {
  if (!inventory) return 0;
  let bonus = 0;
  for (const item of inventory) {
    if (item.type === 'equipment' && item.effect) {
      for (const parsed of parseAllEffects(item.effect)) {
        if (parsed.type === 'roll_bonus' && parsed.value) bonus += parsed.value;
      }
    }
  }
  return Math.min(bonus, 5);
}
