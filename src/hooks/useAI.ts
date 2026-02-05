import { useChatStore } from '../store/chat-store';
import { useCampaignStore } from '../store/campaign-store';
import { getGameEngine } from '../services/game/game-engine';
import * as messageRepo from '../services/storage/message-repo';
import * as recapRepo from '../services/storage/recap-repo';
import * as entityRepo from '../services/storage/entity-repo';
import * as factRepo from '../services/storage/fact-repo';
import { deleteMessagesAfterTimestamp } from '../services/storage/message-repo';
import { generateMystery, toMysteryAnswer } from '../services/ai/mystery-generator';
import { saveMysteryAnswer } from '../services/storage/mystery-answer-repo';
import { t } from '../services/i18n/use-i18n';
import type { NewMessage } from '../types/models';

/**
 * Hook to manage AI interactions for detective narrative.
 * No dice, no attributes, no combat - pure investigation.
 */
export function useAI(campaignId: string | null) {
  const { messages, addMessage, removeMessagesAfter, setAIResponding, setStreamedContent, appendStreamedContent, setError, setSuggestedActions } = useChatStore();
  const { getActiveCampaign } = useCampaignStore();
  const gameEngine = getGameEngine();

  /**
   * Send user message and get AI response
   */
  const sendMessage = async (content: string) => {
    if (!campaignId) {
      throw new Error('No active campaign');
    }

    const campaign = getActiveCampaign();
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    try {
      const userMessage: NewMessage = {
        campaignId,
        role: 'user',
        content: content.trim(),
      };

      const savedUserMessage = await messageRepo.createMessage(userMessage);
      addMessage(savedUserMessage);

      setAIResponding(true);
      setStreamedContent('');
      setError(null);

      const recap = await recapRepo.getRecapByCampaign(campaignId) || null;
      const entities = await entityRepo.getEntitiesByCampaign(campaignId);
      const facts = await factRepo.getFactsByCampaign(campaignId);

      const allMessages = [...messages, savedUserMessage];

      const response = await gameEngine.getAIResponse(
        {
          campaign,
          messages: allMessages,
          recap,
          entities,
          facts,
        },
        (chunk) => appendStreamedContent(chunk)
      );

      if (response.usedFallback) {
        const offlineNotice: NewMessage = {
          campaignId,
          role: 'system',
          content: t('common.aiOfflineNotice'),
        };
        const savedNotice = await messageRepo.createMessage(offlineNotice);
        addMessage(savedNotice);
      }

      const aiMessage: NewMessage = {
        campaignId,
        role: 'ai',
        content: response.content,
      };

      const savedAIMessage = await messageRepo.createMessage(aiMessage);
      addMessage(savedAIMessage);

      setAIResponding(false);
      setStreamedContent('');
      setSuggestedActions(response.suggestedActions);
    } catch (err) {
      setError((err as Error).message);
      setAIResponding(false);
      setStreamedContent('');
      throw err;
    }
  };

  /**
   * Start a new case - generate mystery with AI and display opening narrative
   */
  const startCampaign = async () => {
    if (!campaignId) {
      throw new Error('No active campaign');
    }

    const campaign = getActiveCampaign();
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    try {
      setAIResponding(true);
      setStreamedContent('');
      setError(null);

      // Generate mystery (opening + secret answer)
      const result = await generateMystery(campaign);

      // Save secret answer for arrest verification (never shown to player)
      const mysteryAnswer = toMysteryAnswer(campaignId, result);
      await saveMysteryAnswer(mysteryAnswer);

      // Display opening narrative as first AI message
      const aiMessage: NewMessage = {
        campaignId,
        role: 'ai',
        content: result.openingNarrative,
      };

      const savedAIMessage = await messageRepo.createMessage(aiMessage);
      addMessage(savedAIMessage);

      setAIResponding(false);
      setStreamedContent('');

      // No suggested actions from mystery generator - AI will suggest on first player message
      setSuggestedActions([]);
    } catch (err) {
      console.error('Error starting campaign:', err);
      setError((err as Error).message);
      setAIResponding(false);
      setStreamedContent('');

      const fallbackContent = t('campaign.startFallback', {
        theme: campaign.theme,
        tone: campaign.tone,
        system: campaign.system,
      });

      const fallbackMessage: NewMessage = {
        campaignId,
        role: 'ai',
        content: fallbackContent,
      };

      const savedFallback = await messageRepo.createMessage(fallbackMessage);
      addMessage(savedFallback);

      const errorNotice: NewMessage = {
        campaignId,
        role: 'system',
        content: t('common.aiErrorNotice'),
      };
      const savedNotice = await messageRepo.createMessage(errorNotice);
      addMessage(savedNotice);

      setError(null);
    }
  };

  /**
   * Resend a message by clearing all subsequent messages and re-sending it
   */
  const resendMessage = async (messageContent: string) => {
    if (!campaignId) {
      throw new Error('No active campaign');
    }

    try {
      const messageToResend = messages
        .filter(m => m.role === 'user' && m.content === messageContent)
        .pop();

      if (!messageToResend) {
        console.warn('Message to resend not found');
        return;
      }

      await deleteMessagesAfterTimestamp(campaignId, messageToResend.createdAt);
      removeMessagesAfter(messageToResend.id);
      await sendMessage(messageContent);
    } catch (err) {
      console.error('Error resending message:', err);
      setError((err as Error).message);
      throw err;
    }
  };

  /**
   * Continue narration - asks AI to continue from where it stopped
   */
  const continueNarration = async () => {
    if (!campaignId) {
      throw new Error('No active campaign');
    }
    try {
      await sendMessage('[Continue the narration]');
    } catch (err) {
      console.error('Error continuing narration:', err);
      setError((err as Error).message);
      throw err;
    }
  };

  return {
    sendMessage,
    startCampaign,
    resendMessage,
    continueNarration,
  };
}
