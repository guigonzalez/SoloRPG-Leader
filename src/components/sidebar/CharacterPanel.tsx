import { useState } from 'react';
import type { Character, InventoryItem } from '../../types/models';
import { getSheetPreset } from '../../services/game/sheet-presets';
import { useCharacterStore } from '../../store/character-store';
import { useChatStore } from '../../store/chat-store';
import { useCampaignStore } from '../../store/campaign-store';
import * as messageRepo from '../../services/storage/message-repo';
import { parseItemEffect, getItemDefinition, formatEquipmentEffects, getItemDisplayName } from '../../services/game/inventory';
import { t } from '../../services/i18n/use-i18n';

interface CharacterPanelProps {
  character: Character;
  campaignSystem: string;
}

/**
 * Character Panel - Displays character stats in sidebar
 */
export function CharacterPanel({ character, campaignSystem }: CharacterPanelProps) {
  const preset = getSheetPreset(campaignSystem);

  const [showBackstory, setShowBackstory] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  // Check if character has any backstory information
  const hasBackstory = character.backstory || character.personality || character.goals || character.fears;

  return (
    <div className="character-panel">
      {/* Character Header */}
      <div style={{
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '2px solid #9cd84e',
      }}>
        <h3 style={{
          fontSize: '14px',
          marginBottom: '8px',
          color: '#9cd84e',
        }}>
          {character.name}
        </h3>
        <div style={{
          fontSize: '12px',
          color: '#6a8f3a',
        }}>
          {t('characterPanel.level')} {character.level}
        </div>
      </div>

      {/* XP */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '10px', color: '#9cd84e' }}>
            {t('characterPanel.experience')}
          </span>
          <span style={{ fontSize: '10px', color: '#6a8f3a' }}>
            {character.experience}
          </span>
        </div>
      </div>

      {/* Hit Points */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '10px', color: '#ff6b6b' }}>
            {t('characterPanel.hitPoints')}
          </span>
          <span style={{ fontSize: '10px', color: '#c92a2a' }}>
            {character.hitPoints} / {character.maxHitPoints}
          </span>
        </div>
        <div style={{
          height: '12px',
          backgroundColor: '#0f380f',
          border: '2px solid #ff6b6b',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${((character.hitPoints / character.maxHitPoints) * 100).toFixed(0)}%`,
            backgroundColor: character.hitPoints <= character.maxHitPoints * 0.25
              ? '#c92a2a' // Critical HP - darker red
              : character.hitPoints <= character.maxHitPoints * 0.5
              ? '#ff6b6b' // Low HP - orange-red
              : '#fa5252', // Healthy HP - bright red
            transition: 'width 0.3s ease, background-color 0.3s ease',
          }} />
        </div>
      </div>

      {/* Attributes */}
      <div style={{ marginBottom: hasBackstory ? '16px' : '0' }}>
        <h4 style={{
          fontSize: '12px',
          marginBottom: '12px',
          color: '#9cd84e',
        }}>
          {t('characterPanel.attributes')}
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px',
        }}>
          {preset.attributes.map((attrDef) => {
            const value = character.attributes[attrDef.name] || 0;
            const modifier = preset.modifierCalculation?.(value);

            return (
              <div
                key={attrDef.name}
                style={{
                  padding: '8px',
                  backgroundColor: '#0f380f',
                  border: '1px solid #9cd84e',
                }}
                title={attrDef.description}
              >
                <div style={{
                  fontSize: '10px',
                  color: '#6a8f3a',
                  marginBottom: '4px',
                }}>
                  {attrDef.displayName}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontSize: '14px',
                    color: '#9cd84e',
                    fontWeight: 'bold',
                  }}>
                    {value}
                  </span>
                  {modifier !== undefined && (
                    <span style={{
                      fontSize: '10px',
                      color: '#6a8f3a',
                    }}>
                      ({modifier >= 0 ? '+' : ''}{modifier})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment Section (Weapon, Armor) */}
      {(character.equippedWeapon || character.equippedArmor) && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '12px',
            color: '#9cd84e',
            marginBottom: '8px',
            fontWeight: 'bold',
          }}>
            {t('inventory.equipped')}
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {character.equippedWeapon && (() => {
              const def = getItemDefinition(character.equippedWeapon!);
              const effects = def ? formatEquipmentEffects(def.effect) : [];
              return def ? (
                <div key="weapon" style={{
                  padding: '8px',
                  backgroundColor: '#0f380f',
                  border: '2px solid #9cd84e',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '9px', color: '#6a8f3a' }}>{t('inventory.weapon')}</div>
                      <div style={{ fontSize: '11px', color: '#9cd84e' }}>{def.name}</div>
                    </div>
                    <button
                      onClick={() => useCharacterStore.getState().unequipItem('weapon')}
                      style={{
                        padding: '4px 8px',
                        fontSize: '8px',
                        fontFamily: '"Press Start 2P", monospace',
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-accent)',
                        border: '2px solid var(--color-border)',
                        cursor: 'pointer',
                      }}
                    >
                      {t('inventory.unequip')}
                    </button>
                  </div>
                  {effects.length > 0 && (
                    <div style={{ fontSize: '9px', color: '#6a8f3a' }}>
                      {effects.join(' · ')}
                    </div>
                  )}
                </div>
              ) : null;
            })()}
            {character.equippedArmor && (() => {
              const def = getItemDefinition(character.equippedArmor!);
              const effects = def ? formatEquipmentEffects(def.effect) : [];
              return def ? (
                <div key="armor" style={{
                  padding: '8px',
                  backgroundColor: '#0f380f',
                  border: '2px solid #9cd84e',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '9px', color: '#6a8f3a' }}>{t('inventory.armor')}</div>
                      <div style={{ fontSize: '11px', color: '#9cd84e' }}>{def.name}</div>
                    </div>
                    <button
                      onClick={() => useCharacterStore.getState().unequipItem('armor')}
                      style={{
                        padding: '4px 8px',
                        fontSize: '8px',
                        fontFamily: '"Press Start 2P", monospace',
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-accent)',
                        border: '2px solid var(--color-border)',
                        cursor: 'pointer',
                      }}
                    >
                      {t('inventory.unequip')}
                    </button>
                  </div>
                  {effects.length > 0 && (
                    <div style={{ fontSize: '9px', color: '#6a8f3a' }}>
                      {effects.join(' · ')}
                    </div>
                  )}
                </div>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {/* Inventory Section */}
      {(character.inventory?.length ?? 0) > 0 && (
        <div style={{ marginBottom: hasBackstory ? '16px' : '0' }}>
          <button
            onClick={() => setShowInventory(!showInventory)}
            aria-expanded={showInventory}
            aria-label={showInventory ? t('common.collapse') : t('common.expand')}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '12px',
              fontFamily: 'var(--font-family)',
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              border: '2px solid var(--color-border)',
              cursor: 'pointer',
              marginBottom: showInventory ? '12px' : '0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{t('inventory.title')}</span>
            <span aria-hidden="true">{showInventory ? '−' : '+'}</span>
          </button>

          {showInventory && (
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              fontSize: '10px',
            }}>
              {character.inventory!.map((item: InventoryItem) => {
                const def = getItemDefinition(item.itemId);
                const isWeapon = def?.equipmentSlot === 'weapon';
                const isArmor = def?.equipmentSlot === 'armor';
                const canEquip = isWeapon || isArmor;
                const isEquipped = (isWeapon && character.equippedWeapon === item.itemId) ||
                  (isArmor && character.equippedArmor === item.itemId);

                return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                    padding: '6px',
                    border: '1px solid var(--color-border)',
                  }}
                  title={item.description}
                >
                  <div>
                    <span style={{ color: 'var(--color-accent)' }}>
                      {def ? getItemDisplayName(def.id, def.name) : item.name}
                    </span>
                    {item.quantity > 1 && (
                      <span style={{ color: 'var(--color-text-secondary)', marginLeft: '6px' }}>x{item.quantity}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {canEquip && !isEquipped && (
                    <button
                      onClick={() => useCharacterStore.getState().equipItem(item.itemId, isWeapon ? 'weapon' : 'armor')}
                      style={{
                        padding: '4px 8px',
                        fontSize: '8px',
                        fontFamily: '"Press Start 2P", monospace',
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-accent)',
                        border: '2px solid var(--color-border)',
                        cursor: 'pointer',
                      }}
                    >
                      {t('inventory.equip')}
                    </button>
                  )}
                  {item.type === 'consumable' && item.effect && (
                    <button
                      onClick={async () => {
                        const ok = await useCharacterStore.getState().useItem(item.id);
                        if (ok) {
                          const campaignId = useCampaignStore.getState().activeCampaignId;
                          if (campaignId) {
                            const effect = parseItemEffect(item.effect || '');
                            const amount = effect?.type === 'heal' ? effect.value : 0;
                            const msg = await messageRepo.createMessage({
                              campaignId,
                              role: 'system',
                              content: `${t('combat.recover', { amount: String(amount) })} (${item.name})`,
                            });
                            useChatStore.getState().addMessage(msg);
                          }
                        }
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '8px',
                        fontFamily: '"Press Start 2P", monospace',
                        backgroundColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-accent)',
                        border: '2px solid var(--color-border)',
                        cursor: 'pointer',
                      }}
                    >
                      {t('inventory.useItem')}
                    </button>
                  )}
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      )}

      {/* Backstory Section */}
      {hasBackstory && (
        <div>
          <button
            onClick={() => setShowBackstory(!showBackstory)}
            aria-expanded={showBackstory}
            aria-label={showBackstory ? t('common.collapse') : t('common.expand')}
            style={{
              width: '100%',
              padding: '8px',
              fontSize: '12px',
              fontFamily: 'var(--font-family)',
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              border: '2px solid var(--color-border)',
              cursor: 'pointer',
              marginBottom: showBackstory ? '12px' : '0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{t('characterCreation.backgroundTab')}</span>
            <span aria-hidden="true">{showBackstory ? '−' : '+'}</span>
          </button>

          {showBackstory && (
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              fontSize: '10px',
              lineHeight: '1.6',
            }}>
              {character.backstory && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '10px',
                    color: '#9cd84e',
                    marginBottom: '6px',
                    fontWeight: 'bold',
                  }}>
                    {t('characterCreation.backstory')}
                  </div>
                  <div style={{
                    color: '#6a8f3a',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {character.backstory}
                  </div>
                </div>
              )}

              {character.personality && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '10px',
                    color: '#9cd84e',
                    marginBottom: '6px',
                    fontWeight: 'bold',
                  }}>
                    {t('characterCreation.personality')}
                  </div>
                  <div style={{
                    color: '#6a8f3a',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {character.personality}
                  </div>
                </div>
              )}

              {character.goals && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '10px',
                    color: '#9cd84e',
                    marginBottom: '6px',
                    fontWeight: 'bold',
                  }}>
                    {t('characterCreation.goals')}
                  </div>
                  <div style={{
                    color: '#6a8f3a',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {character.goals}
                  </div>
                </div>
              )}

              {character.fears && (
                <div>
                  <div style={{
                    fontSize: '10px',
                    color: '#9cd84e',
                    marginBottom: '6px',
                    fontWeight: 'bold',
                  }}>
                    {t('characterCreation.fears')}
                  </div>
                  <div style={{
                    color: '#6a8f3a',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {character.fears}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
