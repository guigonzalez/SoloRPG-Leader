import { useState, useEffect } from 'react';
import { getTimelineEventsByCampaign } from '../../services/storage/timeline-event-repo';
import { t } from '../../services/i18n/use-i18n';
import { formatTime } from '../../utils/date';
import type { TimelineEvent, TimelineEventType } from '../../types/models';

interface TimelinePanelProps {
  campaignId: string;
  /** Increment to refetch (e.g. after new decision) */
  refreshTrigger?: number;
}

/** Each decision/event ≈ 1 quarter (3 months). 4 quarters = 1 year. */
const QUARTERS_PER_YEAR = 4;

function getYearQuarter(eventIndex: number): { year: number; quarter: number } {
  const quarter = eventIndex + 1; // 1-based
  const year = Math.floor((quarter - 1) / QUARTERS_PER_YEAR) + 1;
  const q = ((quarter - 1) % QUARTERS_PER_YEAR) + 1;
  return { year, quarter: q };
}

function getEventTypeLabel(type: TimelineEventType): string {
  return t(`timeline.${type === 'election_held' ? 'electionHeld' : type === 'election_postponed' ? 'electionPostponed' : type}`);
}

function EventIcon({ type }: { type: TimelineEventType }) {
  if (type === 'election_held') {
    return (
      <span style={{ fontSize: '14px' }} title={t('timeline.electionHeld')}>
        ✓
      </span>
    );
  }
  if (type === 'election_postponed') {
    return (
      <span style={{ fontSize: '14px' }} title={t('timeline.electionPostponed')}>
        ⊘
      </span>
    );
  }
  return (
    <span style={{ fontSize: '12px', opacity: 0.8 }}>●</span>
  );
}

export function TimelinePanel({ campaignId, refreshTrigger }: TimelinePanelProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    getTimelineEventsByCampaign(campaignId).then(setEvents);
  }, [campaignId, refreshTrigger]);

  if (events.length === 0) {
    return (
      <div
        className="timeline-panel"
        style={{
          padding: '16px',
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
        }}
      >
        <h3 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--color-accent)' }}>
          {t('timeline.title')}
        </h3>
        <p style={{ margin: 0 }}>{t('timeline.empty')}</p>
      </div>
    );
  }

  return (
    <div
      className="timeline-panel"
      style={{
        padding: '12px',
        paddingLeft: '8px',
      }}
    >
      <h3 style={{ fontSize: '13px', marginBottom: '12px', color: 'var(--color-accent)' }}>
        {t('timeline.title')}
      </h3>
      <div
        style={{
          position: 'relative',
          paddingLeft: '20px',
          borderLeft: '2px solid var(--color-border)',
        }}
      >
        {events.map((evt, index) => (
          <div
            key={evt.id}
            style={{
              position: 'relative',
              marginBottom: index < events.length - 1 ? '16px' : 0,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '-26px',
                top: '2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg-secondary)',
                border: '2px solid var(--color-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent)',
              }}
            >
              <EventIcon type={evt.type} />
            </div>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--color-text-secondary)',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>
                {t('timeline.yearQuarter', {
                  year: getYearQuarter(index).year,
                  quarter: getYearQuarter(index).quarter,
                })}
              </span>
              <span>·</span>
              <span>{formatTime(evt.createdAt)}</span>
              <span>·</span>
              <span>{getEventTypeLabel(evt.type)}</span>
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-primary)',
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              {evt.label}
            </div>
            {evt.impactSummary && (
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--color-text-secondary)',
                  marginTop: '4px',
                  fontStyle: 'italic',
                }}
              >
                {evt.impactSummary}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
