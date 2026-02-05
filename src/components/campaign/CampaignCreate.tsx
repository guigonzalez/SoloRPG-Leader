import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { validateCampaignTitle, validateCampaignTheme, validateCampaignTone } from '../../utils/validation';
import { generateMysterySuggestion } from '../../services/ai/campaign-generator';
import { t } from '../../services/i18n/use-i18n';
import type { NewCampaign } from '../../types/models';

interface CampaignCreateProps {
  onCreateCampaign: (campaign: NewCampaign) => Promise<void>;
  onCancel: () => void;
}

const MYSTERY_STYLE_IDS = ['christie', 'holmes', 'express', 'rural', 'noir'] as const;

export function CampaignCreate({ onCreateCampaign, onCancel }: CampaignCreateProps) {
  const [title, setTitle] = useState('');
  const [style, setStyle] = useState('');
  const [theme, setTheme] = useState('');
  const [tone, setTone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    setErrors({});

    try {
      const suggestion = await generateMysterySuggestion(style || 'christie');
      setTitle(suggestion.title);
      setTheme(suggestion.theme);
      setTone(suggestion.tone);
    } catch (error) {
      setErrors({ submit: `${t('campaignCreation.generateFailed')}: ${(error as Error).message}` });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const titleError = validateCampaignTitle(title);
    const themeError = validateCampaignTheme(theme);
    const toneError = validateCampaignTone(tone);

    if (titleError) newErrors.title = titleError;
    if (themeError) newErrors.theme = themeError;
    if (toneError) newErrors.tone = toneError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateCampaign({
        title,
        system: 'Detective',
        theme,
        tone,
      });
    } catch (error) {
      setErrors({ submit: (error as Error).message });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="campaign-list-page campaign-create-page">
      <div className="campaign-list-scroll">
        <div className="retro-container">
          <div className="campaign-create-header">
            <button className="retro-button" onClick={onCancel}>
              {t('common.back')}
            </button>
            <h1 className="campaign-create-title">{t('campaignCreation.title')}</h1>
            <p className="campaign-create-subtitle">
              {t('campaignCreation.subtitle')}
            </p>
          </div>
          <Card title="">
            <form onSubmit={handleSubmit}>
              <Input
                label={t('campaignCreation.campaignTitle')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('campaignCreation.campaignTitlePlaceholder')}
                required
              />
              {errors.title && (
                <div style={{ color: 'var(--color-accent)', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>
                  {errors.title}
                </div>
              )}

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label" style={{ margin: 0 }}>{t('campaignCreation.mysteryStyle')}</label>
                  <button
                    type="button"
                    className="retro-button"
                    onClick={handleGenerateWithAI}
                    disabled={isGenerating}
                    style={{ fontSize: '11px', padding: '4px 8px', minWidth: 'auto' }}
                  >
                    {isGenerating ? t('campaignCreation.generating') : t('campaignCreation.generateWithAI')}
                  </button>
                </div>
                <select
                  className="form-select"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                >
                  <option value="">{t('campaignCreation.selectStyle')}</option>
                  {MYSTERY_STYLE_IDS.map((id) => (
                    <option key={id} value={id}>{t(`campaignCreation.mysteryStyles.${id}`)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('campaignCreation.theme')}</label>
                <textarea
                  className="form-textarea"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder={t('campaignCreation.themePlaceholder')}
                  rows={3}
                  required
                />
              </div>
              {errors.theme && (
                <div style={{ color: 'var(--color-accent)', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>
                  {errors.theme}
                </div>
              )}

              <Input
                label={t('campaignCreation.tone')}
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder={t('campaignCreation.tonePlaceholder')}
                required
              />
              {errors.tone && (
                <div style={{ color: 'var(--color-accent)', fontSize: '12px', marginTop: '-8px', marginBottom: '8px' }}>
                  {errors.tone}
                </div>
              )}

              {errors.submit && (
                <div className="error-container mb-md">{errors.submit}</div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t('campaignCreation.creating') : t('campaignCreation.startCampaign')}
                </Button>
                <Button type="button" onClick={onCancel}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
