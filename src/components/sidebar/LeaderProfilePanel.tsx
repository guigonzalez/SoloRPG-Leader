import { useState, useEffect } from 'react';
import { getLeaderByCampaign } from '../../services/storage/leader-repo';
import { t } from '../../services/i18n/use-i18n';
import type { Leader, PoliticalAxes, NationState } from '../../types/models';

interface LeaderProfilePanelProps {
  campaignId: string;
  /** Increment to refetch leader (e.g. after new AI message with impact) */
  refreshTrigger?: number;
}

/** Political axis icons */
const AXIS_ICONS: Record<keyof PoliticalAxes, React.ReactNode> = {
  economic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  social: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  governance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M3 21h18" />
      <path d="M6 21V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v14" />
      <path d="M6 13h12" />
    </svg>
  ),
  military: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  diplomatic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

/** Nation state icons */
const NATION_ICONS: Record<keyof NationState, React.ReactNode> = {
  stability: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M3 21h18" />
      <path d="M6 21V12l6-6 6 6v9" />
      <path d="M12 6v15" />
    </svg>
  ),
  economy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  wellbeing: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  inequality: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M12 3v18" />
      <path d="M8 9h8" />
      <path d="M6 15h12" />
      <path d="M4 21h4" />
      <path d="M16 21h4" />
    </svg>
  ),
  internationalStanding: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
};

function ImpactBadge({ delta, invertColor = false }: { delta: number; invertColor?: boolean }) {
  const rawPos = delta > 0;
  const isGood = invertColor ? !rawPos : rawPos;
  const Arrow = rawPos ? (
    <span style={{ fontSize: '12px', lineHeight: 1 }}>↑</span>
  ) : (
    <span style={{ fontSize: '12px', lineHeight: 1 }}>↓</span>
  );
  return (
    <span className={`impact-badge ${isGood ? 'positive' : 'negative'}`}>
      {Arrow}
      {rawPos ? `+${delta}` : delta}
    </span>
  );
}

function PoliticalAxisBar({
  leftLabel,
  rightLabel,
  value,
  delta,
  icon,
}: {
  leftLabel: string;
  rightLabel: string;
  value: number;
  delta?: number;
  icon: React.ReactNode;
}) {
  const pct = Math.max(0, Math.min(100, (value + 100) / 2));
  const hasImpact = delta != null && delta !== 0;

  return (
    <div className={hasImpact ? 'impact-bar-changed' : ''} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', padding: hasImpact ? '6px' : 0, marginLeft: hasImpact ? -6 : 0, marginRight: hasImpact ? -6 : 0, borderRadius: '6px' }}>
      <div style={{ flexShrink: 0, color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            marginBottom: '3px',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span>{leftLabel}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {hasImpact && <ImpactBadge delta={delta!} />}
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{value}</span>
          </span>
        </div>
        <div
          style={{
            height: '8px',
            backgroundColor: 'var(--color-border)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: 'var(--color-accent)',
              borderRadius: '4px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginTop: '2px', color: 'var(--color-text-secondary)', opacity: 0.8 }}>
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      </div>
    </div>
  );
}

function NationStateBar({
  label,
  value,
  delta,
  icon,
  invertColor = false,
  invertBadgeColor = false,
}: {
  label: string;
  value: number;
  delta?: number;
  icon: React.ReactNode;
  invertColor?: boolean;
  invertBadgeColor?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const hasImpact = delta != null && delta !== 0;
  const color = invertColor
    ? value <= 33
      ? 'var(--color-impact-positive)'
      : value >= 66
        ? 'var(--color-impact-negative)'
        : 'var(--color-accent)'
    : value <= 33
      ? 'var(--color-impact-negative)'
      : value >= 66
        ? 'var(--color-impact-positive)'
        : 'var(--color-accent)';

  return (
    <div className={hasImpact ? 'impact-bar-changed' : ''} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', padding: hasImpact ? '6px' : 0, marginLeft: hasImpact ? -6 : 0, marginRight: hasImpact ? -6 : 0, borderRadius: '6px' }}>
      <div style={{ flexShrink: 0, color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            marginBottom: '3px',
            color: 'var(--color-text-secondary)',
          }}
        >
          <span>{label}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {hasImpact && <ImpactBadge delta={delta!} invertColor={invertBadgeColor} />}
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{value}</span>
          </span>
        </div>
        <div
          style={{
            height: '8px',
            backgroundColor: 'var(--color-border)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: color,
              borderRadius: '4px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}

const AXIS_ORDER: (keyof PoliticalAxes)[] = ['economic', 'social', 'governance', 'military', 'diplomatic'];
const NATION_ORDER: (keyof NationState)[] = ['stability', 'economy', 'wellbeing', 'inequality', 'internationalStanding'];

export function LeaderProfilePanel({ campaignId, refreshTrigger }: LeaderProfilePanelProps) {
  const [leader, setLeader] = useState<Leader | null>(null);

  useEffect(() => {
    getLeaderByCampaign(campaignId).then((l) => setLeader(l ?? null));
  }, [campaignId, refreshTrigger]);

  if (!leader) {
    return (
      <div
        className="leader-profile-panel"
        style={{ padding: '12px', fontSize: '12px', color: 'var(--color-text-secondary)' }}
      >
        {t('leader.profilePending')}
      </div>
    );
  }

  const axes = leader.politicalAxes;
  const ns = leader.nationState;
  const lastImpact = leader.lastImpact;
  const lastNation = leader.lastNationImpact;
  const summary = leader.lastDecisionSummary;

  return (
    <div
      className="leader-profile-panel"
      style={{
        padding: '12px',
        borderBottom: '2px solid var(--color-accent)',
        marginBottom: '16px',
      }}
    >
      <h3 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--color-accent)' }}>
        {leader.name} {leader.title && `— ${leader.title}`}
      </h3>

      {summary && (
        <div
          className="impact-summary-card"
          style={{
            marginBottom: '14px',
            padding: '12px 14px',
            backgroundColor: 'var(--color-surface-alt)',
            border: '2px solid var(--color-accent)',
            borderLeft: '5px solid var(--color-accent)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--color-text-primary)',
            lineHeight: 1.5,
            boxShadow: '0 2px 8px rgba(30, 58, 95, 0.15)',
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: '6px',
              color: 'var(--color-accent)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '14px' }}>⚡</span>
            {t('leader.lastDecisionImpact')}
          </div>
          <div style={{ fontWeight: 500 }}>{summary}</div>
        </div>
      )}

      {/* Political profile - bars with icons */}
      <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
        {t('leader.politicalProfile')}
      </div>
      {AXIS_ORDER.map((key) => (
        <PoliticalAxisBar
          key={key}
          leftLabel={t(`leader.axis.${key}.left`)}
          rightLabel={t(`leader.axis.${key}.right`)}
          value={axes[key]}
          delta={lastImpact?.[key]}
          icon={AXIS_ICONS[key]}
        />
      ))}

      {/* Nation state - bars with icons */}
      {ns && (
        <>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-text-secondary)',
              marginBottom: '8px',
              paddingTop: '10px',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            {t('leader.nationWellbeing')}
          </div>
          {NATION_ORDER.map((key) => (
            <NationStateBar
              key={key}
              label={t(`leader.nationState.${key}`)}
              value={ns[key]}
              delta={lastNation?.[key as keyof typeof lastNation]}
              icon={NATION_ICONS[key]}
              invertColor={key === 'inequality'}
              invertBadgeColor={key === 'inequality'}
            />
          ))}
        </>
      )}
    </div>
  );
}
