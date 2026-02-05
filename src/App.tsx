import { useState, useEffect, useRef, useCallback } from 'react';
import { CampaignList } from './components/campaign/CampaignList';
import { CaseClosedOverlay } from './components/campaign/CaseClosedOverlay';
import { ChatContainer } from './components/chat/ChatContainer';
import { Sidebar } from './components/sidebar/Sidebar';
import { ApiKeySetup } from './components/common/ApiKeySetup';
import { SettingsModal } from './components/common/SettingsModal';
import { useCampaignStore } from './store/campaign-store';
import { useChatStore } from './store/chat-store';
import { useUIStore } from './store/ui-store';
import { useMessages } from './hooks/useMessages';
import { useAI } from './hooks/useAI';
import { hasApiKey } from './services/storage/api-key-storage';
import { getOrCreateOnboardingCampaign } from './services/onboarding/onboarding-campaign';
import { extractMemory } from './services/ai/memory-extractor';
import { t } from './services/i18n/use-i18n';
import * as recapRepo from './services/storage/recap-repo';
import * as entityRepo from './services/storage/entity-repo';
import * as factRepo from './services/storage/fact-repo';
import type { Campaign, Recap, Entity, SuggestedAction } from './types/models';
import { MAX_ATTEMPTS_BY_DIFFICULTY } from './services/presets/preset-campaigns';
import './styles/main.css';

function App() {
  const [showApiKeySetup, setShowApiKeySetup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [recap, setRecap] = useState<Recap | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isUpdatingRecap, setIsUpdatingRecap] = useState(false);
  const campaignInitializedRef = useRef<string | null>(null);
  const lastAutoRecapMessageCountRef = useRef<number>(0);

  const { activeCampaignId, setActiveCampaign, getActiveCampaign, updateCampaign, loadCampaigns } = useCampaignStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { isAIResponding, streamedContent, suggestedActions, messagesLoaded, loadedMessageCount, loadGeneration } = useChatStore();
  const activeCampaign = getActiveCampaign();

  const { messages } = useMessages(activeCampaignId);
  const { sendMessage, startCampaign, resendMessage, continueNarration } = useAI(activeCampaignId);

  useEffect(() => {
    setShowApiKeySetup(!hasApiKey());
  }, []);

  const handleSelectCampaign = useCallback((campaign: Campaign) => {
    setActiveCampaign(campaign.id);
  }, [setActiveCampaign]);

  const handleBackToCampaigns = useCallback(() => {
    campaignInitializedRef.current = null;
    setActiveCampaign(null);
  }, [setActiveCampaign]);

  const runMemoryExtraction = useCallback(
    async (showAlert = false) => {
      if (!activeCampaignId || messages.length === 0) return;

      setIsUpdatingRecap(true);
      try {
        const extracted = await extractMemory(messages);

        if (extracted.recap) {
          const updatedRecap: Recap = {
            campaignId: activeCampaignId,
            summaryShort: extracted.recap,
            updatedAt: Date.now(),
          };
          await recapRepo.upsertRecap(updatedRecap);
          setRecap(updatedRecap);
        }

        for (const entity of extracted.entities) {
          await entityRepo.createEntity({
            campaignId: activeCampaignId,
            name: entity.name,
            type: entity.type,
            blurb: entity.blurb,
          });
        }

        for (const fact of extracted.facts) {
          const allEntities = await entityRepo.getEntitiesByCampaign(activeCampaignId);
          const subjectEntity = allEntities.find(e => e.name === fact.subjectEntityId);

          if (subjectEntity) {
            await factRepo.createFact({
              campaignId: activeCampaignId,
              subjectEntityId: subjectEntity.id,
              predicate: fact.predicate,
              object: fact.object,
              sourceMessageId: fact.sourceMessageId,
            });
          }
        }

        const loadedEntities = await entityRepo.getEntitiesByCampaign(activeCampaignId);
        setEntities(loadedEntities);

        if (showAlert) {
          alert(`${t('recap.memoryUpdated')}\n- ${t('recap.extractedRecap')}: ${extracted.recap ? t('recap.yes') : t('recap.no')}\n- ${t('recap.extractedEntities')}: ${extracted.entities.length}\n- ${t('recap.extractedFacts')}: ${extracted.facts.length}`);
        }
      } catch (err) {
        console.error('Failed to update recap:', err);
        if (showAlert) {
          alert(t('errors.failedToUpdateRecap') + ': ' + (err as Error).message);
        }
      } finally {
        setIsUpdatingRecap(false);
      }
    },
    [activeCampaignId, messages]
  );

  const handleUpdateRecap = useCallback(() => runMemoryExtraction(true), [runMemoryExtraction]);

  useEffect(() => {
    const loadMemory = async () => {
      if (!activeCampaignId) {
        setRecap(null);
        setEntities([]);
        return;
      }

      try {
        const loadedRecap = await recapRepo.getRecapByCampaign(activeCampaignId);
        const loadedEntities = await entityRepo.getEntitiesByCampaign(activeCampaignId);

        setRecap(loadedRecap || null);
        setEntities(loadedEntities);
      } catch (err) {
        console.error('Failed to load memory:', err);
      }
    };

    loadMemory();
  }, [activeCampaignId]);

  useEffect(() => {
    campaignInitializedRef.current = null;
    lastAutoRecapMessageCountRef.current = 0;
  }, [activeCampaignId]);

  useEffect(() => {
    if (!activeCampaignId || !messagesLoaded) {
      return;
    }

    if (campaignInitializedRef.current === activeCampaignId) {
      return;
    }

    const initCampaign = async () => {
      campaignInitializedRef.current = activeCampaignId;

      if (loadedMessageCount === 0 && !isAIResponding) {
        try {
          await startCampaign();
        } catch (err) {
          console.error('Failed to start campaign:', err);
        }
      }
    };

    initCampaign();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadGeneration]);

  const handleApiKeySetupComplete = () => {
    setShowApiKeySetup(false);
    window.location.reload();
  };

  const handleTryTutorial = async () => {
    try {
      const campaign = await getOrCreateOnboardingCampaign();
      await loadCampaigns();
      setActiveCampaign(campaign.id);
      setShowApiKeySetup(false);
    } catch (err) {
      console.error('Failed to start tutorial:', err);
      alert('Failed to start tutorial: ' + (err as Error).message);
    }
  };

  useEffect(() => {
    if (!activeCampaignId || !messagesLoaded || messages.length === 0) return;

    const count = messages.length;
    if (count >= 5 && count % 5 === 0 && count !== lastAutoRecapMessageCountRef.current) {
      lastAutoRecapMessageCountRef.current = count;
      runMemoryExtraction(false);
    }
  }, [activeCampaignId, messagesLoaded, messages.length, runMemoryExtraction]);

  if (showApiKeySetup) {
    return (
      <ApiKeySetup
        onComplete={handleApiKeySetupComplete}
        onTryTutorial={handleTryTutorial}
      />
    );
  }

  const handleSelectAction = async (action: SuggestedAction) => {
    useChatStore.getState().setSuggestedActions([]);
    await sendMessage(action.action);
  };

  const handleEndSession = async () => {
    if (!activeCampaignId || !activeCampaign) return;

    const confirmed = confirm(t('campaign.endSessionConfirm'));

    if (!confirmed) return;

    try {
      await runMemoryExtraction(false);
      alert(t('campaign.sessionSaved'));
      handleBackToCampaigns();
    } catch (err) {
      console.error('Failed to end session:', err);
      alert(t('errors.failedToSaveSession') + ': ' + (err as Error).message);
    }
  };

  const handleCaseSolved = async (answer: { criminal: string; weapon: string; motive: string }) => {
    if (!activeCampaignId) return;
    await updateCampaign(activeCampaignId, {
      status: 'solved',
      solvedAnswer: answer,
    });
  };

  const handleCaseFailed = async (answer?: { criminal: string; weapon: string; motive: string }) => {
    if (!activeCampaignId) return;
    await updateCampaign(activeCampaignId, {
      status: 'failed',
      solvedAnswer: answer ?? { criminal: '', weapon: '', motive: '' },
    });
  };

  const handleSaveNotes = async (notes: string) => {
    if (!activeCampaignId) return;
    await updateCampaign(activeCampaignId, { notes });
  };

  if (!activeCampaignId || !activeCampaign) {
    return <CampaignList onSelectCampaign={handleSelectCampaign} />;
  }

  const isCampaignFinished = activeCampaign.status === 'solved' || activeCampaign.status === 'failed';

  return (
    <div className="app-container">
      <div className="main-content" style={{ position: 'relative' }}>
        <div className="app-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="retro-button header-back-btn" onClick={handleBackToCampaigns}>
              {t('common.back')}
            </button>
            <button
              className="retro-button sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={t('sidebar.gameInfo')}
              title={t('sidebar.gameInfo')}
            >
              {t('sidebar.menu')}
            </button>
          </div>
          <h1 className="app-title">{activeCampaign.title}</h1>
          <div>
            <button className="retro-button header-settings-btn" onClick={() => setShowSettings(true)}>
              {t('common.settings')}
            </button>
          </div>
        </div>

        <ChatContainer
          messages={messages}
          onSendMessage={sendMessage}
          onResendMessage={resendMessage}
          onContinueNarration={continueNarration}
          isAIResponding={isAIResponding}
          streamedContent={streamedContent}
          suggestedActions={suggestedActions}
          onSelectAction={handleSelectAction}
          disabled={isCampaignFinished}
        />

        {isCampaignFinished && (
          <CaseClosedOverlay
            status={activeCampaign.status as 'solved' | 'failed'}
            answer={activeCampaign.solvedAnswer}
            onBackToCampaigns={handleBackToCampaigns}
          />
        )}
      </div>

      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />
      <Sidebar
        recap={recap}
        entities={entities}
        campaignId={activeCampaignId}
        maxArrestAttempts={activeCampaign?.difficulty ? MAX_ATTEMPTS_BY_DIFFICULTY[activeCampaign.difficulty] : 3}
        notes={activeCampaign?.notes ?? ''}
        onSaveNotes={handleSaveNotes}
        onEndSession={handleEndSession}
        onUpdateRecap={handleUpdateRecap}
        onCaseSolved={handleCaseSolved}
        onCaseFailed={handleCaseFailed}
        isUpdatingRecap={isUpdatingRecap}
        isOpen={sidebarOpen}
        onClose={toggleSidebar}
      />

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

export default App;
