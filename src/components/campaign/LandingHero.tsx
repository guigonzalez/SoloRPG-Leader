import { Button } from '../common/Button';
import { t } from '../../services/i18n/use-i18n';

interface LandingHeroProps {
  onQuickStart: () => void;
  onTutorial: () => void;
  onCreateCampaign: () => void;
  onImport: () => void;
  onSettings: () => void;
  hasCampaigns: boolean;
}

export function LandingHero({
  onQuickStart,
  onTutorial,
  onCreateCampaign,
  onImport,
  onSettings,
  hasCampaigns,
}: LandingHeroProps) {
  return (
    <div className="landing-hero">
      <div className="landing-hero-content">
        <div className="landing-hero-badge">
          {t('landing.badge')}
        </div>
        <h1 className="landing-hero-title">
          {t('landing.title')}
        </h1>
        <p className="landing-hero-tagline">
          {t('landing.tagline')}
        </p>
        <p className="landing-hero-description">
          {t('landing.description')}
        </p>

        <div className="landing-hero-actions">
          <Button
            className="landing-cta-primary"
            onClick={onQuickStart}
          >
            {t('landing.quickStartCta')}
          </Button>
          <button
            className="retro-button landing-btn"
            onClick={onTutorial}
            style={{ borderStyle: 'dashed' }}
          >
            {t('landing.tutorialCta')}
          </button>
          <div className="landing-hero-secondary">
            <button className="retro-button landing-btn" onClick={onCreateCampaign}>
              {t('landing.createCustom')}
            </button>
            <button className="retro-button landing-btn" onClick={onImport}>
              {t('settings.importCampaign')}
            </button>
            <button className="retro-button landing-btn landing-btn-ghost" onClick={onSettings}>
              {t('common.settings')}
            </button>
          </div>
        </div>

        {!hasCampaigns && (
          <div className="landing-hero-hint">
            {t('landing.firstTimeHint')}
          </div>
        )}
      </div>

      <div className="landing-hero-decoration" aria-hidden="true">
        <pre className="landing-ascii">
{`    +------------------+
    | Solo Levelling   |
    +------------------+`}
        </pre>
      </div>
    </div>
  );
}
