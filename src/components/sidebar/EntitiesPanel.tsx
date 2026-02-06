import { t } from '../../services/i18n/use-i18n';
import type { Entity } from '../../types/models';

interface EntitiesPanelProps {
  entities: Entity[];
}

export function EntitiesPanel({ entities }: EntitiesPanelProps) {
  if (entities.length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
        fontSize: '14px',
        border: '2px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-secondary)'
      }}>
        {t('entitiesPanel.empty')}
        <div style={{
          marginTop: '12px',
          fontSize: '12px'
        }}>
          {t('entitiesPanel.updateHint')}
        </div>
      </div>
    );
  }

  return (
    <div className="entity-list">
      {entities.map((entity) => (
        <div key={entity.id} className="entity-item">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '8px',
            gap: '8px',
            flexWrap: 'wrap',
          }}>
            <div className="entity-name" style={{ flex: 1 }}>{entity.name}</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {entity.relation && (
                <span style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  backgroundColor: entity.relation === 'ally' ? 'rgba(76, 175, 80, 0.2)' : entity.relation === 'internal_enemy' || entity.relation === 'external_enemy' ? 'rgba(244, 67, 54, 0.2)' : 'var(--color-bg-primary)',
                  border: `1px solid ${entity.relation === 'ally' ? 'var(--color-accent)' : entity.relation === 'internal_enemy' || entity.relation === 'external_enemy' ? 'var(--color-impact-negative, #e57373)' : 'var(--color-border)'}`,
                  whiteSpace: 'nowrap',
                }}>
                  {t(`entitiesPanel.relation.${entity.relation}`)}
                </span>
              )}
              <span style={{
                fontSize: '10px',
                padding: '2px 6px',
                backgroundColor: 'var(--color-bg-primary)',
                border: '1px solid var(--color-border)',
                whiteSpace: 'nowrap'
              }}>
                {t(`entitiesPanel.${entity.type}`)}
              </span>
            </div>
          </div>
          {entity.blurb && (
            <div className="entity-blurb" style={{
              fontSize: '13px',
              lineHeight: '1.6',
              color: 'var(--color-text-primary)'
            }}>
              {entity.blurb}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
