import { useState, useEffect } from 'react';
import { getLeaderByCampaign } from '../../services/storage/leader-repo';
import { t } from '../../services/i18n/use-i18n';
import type { Campaign, Recap, Leader, PoliticalAxes, NationState } from '../../types/models';

interface ReignSummaryOverlayProps {
  campaign: Campaign;
  recap: Recap | null;
  onFinish: () => void;
  onCancel: () => void;
}

const AXIS_KEYS: (keyof PoliticalAxes)[] = ['economic', 'social', 'governance', 'military', 'diplomatic'];
const NATION_KEYS: (keyof NationState)[] = ['stability', 'economy', 'wellbeing', 'inequality', 'internationalStanding'];

export function ReignSummaryOverlay({ campaign, recap, onFinish, onCancel }: ReignSummaryOverlayProps) {
  const [leader, setLeader] = useState<Leader | null>(null);

  useEffect(() => {
    getLeaderByCampaign(campaign.id).then((l) => setLeader(l ?? null));
  }, [campaign.id]);

  return (
    <div
      className="reign-summary-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: 'var(--color-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          backgroundColor: 'var(--color-bg-primary)',
          border: '3px solid var(--color-accent)',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            marginBottom: '8px',
            color: 'var(--color-accent)',
            textAlign: 'center',
          }}
        >
          {t('reignSummary.title')}
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          {campaign.nation} — {campaign.title}
        </p>

        {recap && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--color-accent)' }}>
              {t('reignSummary.mandateSummary')}
            </h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--color-text-primary)' }}>{recap.summaryShort}</p>
          </div>
        )}

        {leader && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--color-accent)' }}>
                {leader.name} {leader.title && `— ${leader.title}`}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                {t('leader.politicalProfile')}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {AXIS_KEYS.map((key) => (
                  <span
                    key={key}
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      backgroundColor: 'var(--color-surface-alt)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '4px',
                    }}
                  >
                    {t(`leader.axis.${key}.left`)} ↔ {t(`leader.axis.${key}.right`)}: {leader.politicalAxes[key]}
                  </span>
                ))}
              </div>
            </div>

            {leader.nationState && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--color-accent)' }}>
                  {t('leader.nationWellbeing')}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {NATION_KEYS.map((key) => (
                    <span
                      key={key}
                      style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        backgroundColor: 'var(--color-surface-alt)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '4px',
                      }}
                    >
                      {t(`leader.nationState.${key}`)}: {leader.nationState![key]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '20px', fontStyle: 'italic' }}>
              {t('reignSummary.closingMessage')}
            </p>
          </>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button className="retro-button" onClick={onCancel}>
            {t('common.cancel')}
          </button>
          <button className="retro-button primary" onClick={onFinish}>
            {t('reignSummary.returnToCampaigns')}
          </button>
        </div>
      </div>
    </div>
  );
}
