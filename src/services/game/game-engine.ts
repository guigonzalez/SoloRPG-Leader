import { getClaudeClient } from '../ai/claude-client';
import { getGeminiClient } from '../ai/gemini-client';
import { buildSystemPrompt } from '../ai/prompt-builder';
import { assembleContext, parseSuggestedActions, type ElectionAction } from '../ai/context-assembler';
import { getAIProvider } from '../storage/api-key-storage';
import { getCurrentLanguage } from '../i18n/use-i18n';
import type { Campaign, Message, Entity, Fact, Recap, SuggestedAction, Leader, DecisionImpact, NationStateImpact } from '../../types/models';
import type { ClaudeMessage } from '../../types/api';

export interface GameEngineContext {
  campaign: Campaign;
  messages: Message[];
  recap: Recap | null;
  entities: Entity[];
  facts: Fact[];
  leader?: Leader | null;
  /** Total decisions with impact so far */
  decisionCount?: number;
  /** Decisions since last election (held or postponed). Election mandatory when >= 16 (4 years). */
  decisionsSinceLastElection?: number;
}

export interface AIResponse {
  content: string;
  suggestedActions: SuggestedAction[];
  impact?: DecisionImpact | null;
  nationImpact?: NationStateImpact | null;
  impactSummary?: string | null;
  electionAction?: ElectionAction | null;
  usedFallback?: boolean;
}

interface AIClient {
  sendMessage(
    systemPrompt: string,
    messages: ClaudeMessage[],
    onChunk: (text: string) => void
  ): Promise<string>;
  sendMessageSync(
    systemPrompt: string,
    messages: ClaudeMessage[]
  ): Promise<string>;
}

/**
 * Game Engine - Orchestrates AI responses for detective narrative.
 * No dice, no attributes, no combat - pure investigation.
 */
export class GameEngine {
  private getClient(): AIClient {
    const provider = getAIProvider();
    return provider === 'gemini' ? getGeminiClient() : getClaudeClient();
  }

  private generateFallbackResponse(language: string): AIResponse {
    const fallbackMessages = {
      en: "The investigation continues. Consider your next move carefully. What would you like to do?",
      pt: "A investigação continua. Considere cuidadosamente seu próximo passo. O que você gostaria de fazer?",
      es: "La investigación continúa. Considera cuidadosamente tu próximo movimiento. ¿Qué te gustaría hacer?",
    };

    return {
      content: fallbackMessages[language as keyof typeof fallbackMessages] || fallbackMessages.en,
      suggestedActions: [],
      usedFallback: true,
    };
  }

  /**
   * Get AI response for player action
   */
  async getAIResponse(
    context: GameEngineContext,
    onChunk: (text: string) => void
  ): Promise<AIResponse> {
    try {
      const systemPrompt = buildSystemPrompt(
        context.campaign,
        context.recap,
        context.entities,
        context.facts,
        context.leader ?? null,
        context.decisionCount ?? 0,
        context.decisionsSinceLastElection ?? 0
      );

      const claudeMessages = assembleContext(context.messages);

      const client = this.getClient();
      const rawContent = await client.sendMessage(
        systemPrompt,
        claudeMessages,
        onChunk
      );

      const { cleanContent, actions, impact, nationImpact, impactSummary, electionAction } = parseSuggestedActions(rawContent);

      return {
        content: cleanContent,
        suggestedActions: actions,
        impact: impact ?? undefined,
        nationImpact: nationImpact ?? undefined,
        impactSummary: impactSummary ?? undefined,
        electionAction: electionAction ?? undefined,
      };
    } catch (error) {
      console.error('AI response failed, using fallback:', error);
      const language = getCurrentLanguage();
      const fallbackResponse = this.generateFallbackResponse(language);
      onChunk(fallbackResponse.content);
      return fallbackResponse;
    }
  }
}

let gameEngineInstance: GameEngine | null = null;

export function getGameEngine(): GameEngine {
  if (!gameEngineInstance) {
    gameEngineInstance = new GameEngine();
  }
  return gameEngineInstance;
}
