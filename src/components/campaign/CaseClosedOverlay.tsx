import { t } from '../../services/i18n/use-i18n';
import type { SolvedAnswer } from '../../types/models';

interface CaseClosedOverlayProps {
  status: 'solved' | 'failed';
  answer?: SolvedAnswer | null;
  onBackToCampaigns: () => void;
}

export function CaseClosedOverlay({ status, answer, onBackToCampaigns }: CaseClosedOverlayProps) {
  const isSolved = status === 'solved';
  const title = isSolved ? t('arrest.caseSolvedTitle') : t('arrest.caseFailedTitle');
  const hasAnswer = answer?.criminal || answer?.weapon || answer?.motive;

  return (
    <div
      className="case-closed-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '32px',
          border: `2px solid var(--color-accent)`,
          backgroundColor: 'var(--color-bg-primary)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '24px',
            marginBottom: '24px',
            color: 'var(--color-accent)',
          }}
        >
          {title}
        </h2>
        {hasAnswer && answer && (
          <div
            style={{
              fontSize: '14px',
              lineHeight: '1.8',
              marginBottom: '24px',
              textAlign: 'left',
              color: 'var(--color-text-primary)',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: 'var(--color-accent)' }}>
              {t('arrest.caseSolvedAnswer')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <strong>{t('arrest.suspect')}:</strong> {answer.criminal}
              </div>
              <div>
                <strong>{t('arrest.weapon')}:</strong> {answer.weapon}
              </div>
              <div>
                <strong>{t('arrest.motive')}:</strong> {answer.motive}
              </div>
            </div>
          </div>
        )}
        <button
          className="retro-button"
          onClick={onBackToCampaigns}
          style={{
            padding: '12px 24px',
            fontSize: '14px',
          }}
        >
          {t('arrest.backToCampaigns')}
        </button>
      </div>
    </div>
  );
}
