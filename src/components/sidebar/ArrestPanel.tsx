import { useState, useEffect } from 'react';
import { getMysteryAnswerByCampaign, incrementArrestAttempts } from '../../services/storage/mystery-answer-repo';
import { verifyArrest } from '../../services/ai/arrest-verifier';
import { getLanguage, getLanguageName } from '../../services/storage/settings-storage';
import * as messageRepo from '../../services/storage/message-repo';
import { useChatStore } from '../../store/chat-store';
import { t } from '../../services/i18n/use-i18n';

const MAX_ATTEMPTS = 3;

interface ArrestPanelProps {
  campaignId: string;
  onCaseSolved: (answer: { criminal: string; weapon: string; motive: string }) => void;
  onCaseFailed: (answer?: { criminal: string; weapon: string; motive: string }) => void;
}

export function ArrestPanel({ campaignId, onCaseSolved, onCaseFailed }: ArrestPanelProps) {
  const [showModal, setShowModal] = useState(false);
  const [suspect, setSuspect] = useState('');
  const [weapon, setWeapon] = useState('');
  const [motive, setMotive] = useState('');
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [hasMystery, setHasMystery] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const { addMessage } = useChatStore();

  useEffect(() => {
    getMysteryAnswerByCampaign(campaignId).then((answer) => {
      setHasMystery(!!answer);
      if (answer) {
        setAttemptsUsed(answer.attemptsUsed ?? 0);
      }
    });
  }, [campaignId]);

  const attemptsRemaining = MAX_ATTEMPTS - attemptsUsed;
  const canArrest = hasMystery && attemptsRemaining > 0 && !showModal;

  const handleSubmitArrest = async () => {
    if (!campaignId || !suspect.trim() || !weapon.trim() || !motive.trim()) {
      return;
    }

    const answer = await getMysteryAnswerByCampaign(campaignId);
    if (!answer) return;

    setIsVerifying(true);

    try {
      const languageName = getLanguageName(getLanguage());
      const result = await verifyArrest(
        answer,
        { criminal: suspect.trim(), weapon: weapon.trim(), motive: motive.trim() },
        attemptsRemaining - 1,
        languageName
      );

      const narrativeMessage = await messageRepo.createMessage({
        campaignId,
        role: 'ai',
        content: result.narrative,
      });
      addMessage(narrativeMessage);

      if (result.correct) {
        const victoryContent = t('arrest.caseSolvedMessage', {
          criminal: answer.criminal,
          weapon: answer.weapon,
          motive: answer.motive,
        });
        const victoryMessage = await messageRepo.createMessage({
          campaignId,
          role: 'system',
          content: victoryContent,
        });
        addMessage(victoryMessage);
        setShowModal(false);
        setSuspect('');
        setWeapon('');
        setMotive('');
        onCaseSolved({
          criminal: answer.criminal,
          weapon: answer.weapon,
          motive: answer.motive,
        });
      } else {
        const newAttemptsUsed = await incrementArrestAttempts(campaignId);
        setAttemptsUsed(newAttemptsUsed);

        if (newAttemptsUsed >= MAX_ATTEMPTS) {
          const defeatContent = t('arrest.caseFailedMessage', {
            criminal: answer.criminal,
            weapon: answer.weapon,
            motive: answer.motive,
          });
          const defeatMessage = await messageRepo.createMessage({
            campaignId,
            role: 'system',
            content: defeatContent,
          });
          addMessage(defeatMessage);
          setShowModal(false);
          onCaseFailed({
            criminal: answer.criminal,
            weapon: answer.weapon,
            motive: answer.motive,
          });
        } else {
          setShowModal(false);
          setSuspect('');
          setWeapon('');
          setMotive('');
        }
      }
    } catch (err) {
      console.error('Arrest verification failed:', err);
      const errorMsg = await messageRepo.createMessage({
        campaignId,
        role: 'system',
        content: t('errors.failedToVerifyArrest'),
      });
      addMessage(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="arrest-panel">
      <div style={{
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '2px solid var(--color-accent)',
      }}>
        <h3 style={{
          fontSize: '14px',
          marginBottom: '8px',
          color: 'var(--color-accent)',
        }}>
          {t('arrest.title')}
        </h3>
        <div style={{
          fontSize: '12px',
          color: 'var(--color-text-secondary)',
          marginBottom: '12px',
        }}>
          {t('arrest.attemptsRemaining', { count: attemptsRemaining.toString() })}
        </div>
        {!hasMystery && (
          <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            {t('arrest.noMysteryYet')}
          </div>
        )}
        <button
          className="retro-button"
          onClick={() => setShowModal(true)}
          disabled={!canArrest}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '12px',
          }}
        >
          {t('arrest.voiceOfArrest')}
        </button>
      </div>

      {showModal && (
        <div
          className="arrest-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => !isVerifying && setShowModal(false)}
        >
          <div
            className="arrest-modal"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              border: '2px solid var(--color-accent)',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ color: 'var(--color-accent)', marginBottom: '16px', fontSize: '14px' }}>
              {t('arrest.accusation')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {t('arrest.suspect')}
                </label>
                <input
                  type="text"
                  value={suspect}
                  onChange={(e) => setSuspect(e.target.value)}
                  placeholder={t('arrest.suspectPlaceholder')}
                  disabled={isVerifying}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '2px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {t('arrest.weapon')}
                </label>
                <input
                  type="text"
                  value={weapon}
                  onChange={(e) => setWeapon(e.target.value)}
                  placeholder={t('arrest.weaponPlaceholder')}
                  disabled={isVerifying}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '2px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {t('arrest.motive')}
                </label>
                <input
                  type="text"
                  value={motive}
                  onChange={(e) => setMotive(e.target.value)}
                  placeholder={t('arrest.motivePlaceholder')}
                  disabled={isVerifying}
                  className="form-input"
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '2px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                className="retro-button"
                onClick={() => !isVerifying && setShowModal(false)}
                disabled={isVerifying}
              >
                {t('common.cancel')}
              </button>
              <button
                className="retro-button"
                onClick={handleSubmitArrest}
                disabled={isVerifying || !suspect.trim() || !weapon.trim() || !motive.trim()}
              >
                {isVerifying ? t('common.loading') : t('arrest.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
