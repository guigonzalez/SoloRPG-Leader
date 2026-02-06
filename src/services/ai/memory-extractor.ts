import { getClaudeClient } from './claude-client';
import { getGeminiClient } from './gemini-client';
import { getAIProvider } from '../storage/api-key-storage';
import { getLanguage, getLanguageName } from '../storage/settings-storage';
import type { Message } from '../../types/models';

import type { EntityRelation } from '../../types/models';

/**
 * Memory extraction result (Leader: nation leadership)
 */
export interface ExtractedMemory {
  recap: string;
  entities: Array<{
    name: string;
    type: 'country' | 'organization' | 'politician' | 'faction' | 'institution' | 'other';
    relation?: EntityRelation;
    blurb: string;
  }>;
  facts: Array<{
    subjectEntityId: string;
    predicate: string;
    object: string;
    sourceMessageId: string;
  }>;
}

/** Max messages to send - full context for consistent extraction */
const MAX_MESSAGES_FOR_EXTRACTION = 100;

/**
 * Build conversation transcript for memory extraction.
 * Single block format so the AI sees full context at once.
 */
function buildConversationTranscript(messages: Message[]): string {
  return messages
    .filter(m => m.role !== 'system')
    .map(m => {
      const speaker = m.role === 'user' ? 'Player' : 'Narrator';
      return `[${m.id}] ${speaker}: ${m.content}`;
    })
    .join('\n\n');
}

/**
 * Extract memory from messages - single AI call with full conversation.
 * The AI analyzes the entire transcript and produces recap + entities + facts in one pass.
 */
export async function extractMemory(messages: Message[]): Promise<ExtractedMemory> {
  const provider = getAIProvider();

  let client;
  if (provider === 'gemini') {
    const geminiClient = getGeminiClient();
    (geminiClient as any).maxTokens = 4000;
    client = geminiClient;
  } else {
    const claudeClient = getClaudeClient();
    (claudeClient as any).maxTokens = 4000;
    client = claudeClient;
  }

  const language = getLanguage();
  const languageName = getLanguageName(language);

  // All messages (up to limit) - full context for consistent extraction
  const messagesToAnalyze = messages.slice(-MAX_MESSAGES_FOR_EXTRACTION);
  const transcript = buildConversationTranscript(messagesToAnalyze);

  const systemPrompt = `You are a memory extraction assistant for a nation leadership solo RPG.

Your task: Given the FULL conversation transcript, produce a single JSON with:
1. **recap** - Brief summary of the mandate so far (max 600 chars), in ${languageName}
2. **entities** - Countries, organizations, politicians, factions (max 10). Types: country, organization, politician, faction, institution, other. For each entity add **relation**: ally (friend/supporter), internal_enemy (opponent within the nation), external_enemy (foreign threat), or neutral
3. **facts** - Key facts to remember, with sourceMessageId from the [id] tags (max 20)

RULES:
- Analyze the ENTIRE conversation in one pass
- Extract only what is explicitly stated - no invention
- All text (recap, entity blurbs, facts) in ${languageName}
- Facts must use the exact message ID from the [id] prefix
- Always produce at least a recap, even from one message
- relation is REQUIRED for each entity

Respond with ONLY valid JSON, no markdown:
{
  "recap": "string",
  "entities": [{"name": "string", "type": "country|organization|politician|faction|institution|other", "relation": "ally|internal_enemy|external_enemy|neutral", "blurb": "string"}],
  "facts": [{"subjectEntityId": "string", "predicate": "string", "object": "string", "sourceMessageId": "string"}]
}`;

  const userMessage = `Analyze this nation leadership conversation and produce the JSON (recap + entities with relation + facts in one response):

--- CONVERSAÇÃO ---

${transcript}

--- FIM ---

Produce the JSON now:`;

  const apiMessages = [{ role: 'user' as const, content: userMessage }];

  const fallbackExtraction = (): ExtractedMemory => {
    const text = messagesToAnalyze
      .map(m => m.content)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const recap = text.length > 600 ? text.substring(0, 597) + '...' : text;
    return { recap, entities: [], facts: [] };
  };

  try {
    console.log('Memory extraction: sending', messagesToAnalyze.length, 'messages as single transcript');

    const response = await client.sendMessageSync(systemPrompt, apiMessages as any);

    const trimmed = (response || '').trim();
    if (!trimmed) {
      console.warn('AI returned empty - using fallback');
      return fallbackExtraction();
    }

    let jsonText = trimmed.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('No JSON in response - using fallback');
      return fallbackExtraction();
    }

    let jsonString = jsonMatch[0];
    let extracted: ExtractedMemory;

    try {
      extracted = JSON.parse(jsonString);
    } catch {
      if (jsonString.includes('"recap":') && !jsonString.includes('"entities":')) {
        jsonString = jsonString.replace(/"recap":\s*"([^"]*?)$/, '"recap": "$1", "entities": [], "facts": []');
        if (!jsonString.endsWith('}')) jsonString += '}';
      }
      if (jsonString.includes('"entities":') && !jsonString.includes('"facts":')) {
        jsonString = jsonString.replace(/"entities":\s*\[.*?$/, '"entities": [], "facts": []');
        if (!jsonString.endsWith('}')) jsonString += '}';
      }
      try {
        extracted = JSON.parse(jsonString);
      } catch {
        return fallbackExtraction();
      }
    }

    if (!extracted.recap) extracted.recap = '';
    if (!extracted.entities) extracted.entities = [];
    if (!extracted.facts) extracted.facts = [];

    if (extracted.recap.length > 600) {
      extracted.recap = extracted.recap.substring(0, 597) + '...';
    }
    if (extracted.entities.length > 10) extracted.entities = extracted.entities.slice(0, 10);
    if (extracted.facts.length > 20) extracted.facts = extracted.facts.slice(0, 20);

    return extracted;
  } catch (error) {
    console.error('Memory extraction failed:', error);
    return fallbackExtraction();
  }
}
