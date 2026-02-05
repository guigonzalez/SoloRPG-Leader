import { getClaudeClient } from './claude-client';
import { getGeminiClient } from './gemini-client';
import { getAIProvider } from '../storage/api-key-storage';
import { getLanguage, getLanguageName } from '../storage/settings-storage';
import type { Campaign } from '../../types/models';

export interface ScenarioGenerationResult {
  openingNarrative: string;
}

/**
 * Generate an opening scenario for a nation leadership game.
 * Presents the first challenge/crisis the leader must face.
 */
export async function generateScenario(campaign: Campaign): Promise<ScenarioGenerationResult> {
  const provider = getAIProvider();
  const client = provider === 'gemini' ? getGeminiClient() : getClaudeClient();
  const language = getLanguage();
  const languageName = getLanguageName(language);

  const systemPrompt = `You are a political drama writer creating scenarios for a nation leadership simulation game.

IMPORTANT: You MUST generate everything in ${languageName}. The opening narrative must be in ${languageName}.

Your task is to create an opening scenario for a leader of ${campaign.nation}. The player will take the role of the nation's leader and must make decisions that affect their political profile.

Setting: ${campaign.theme}
Tone: ${campaign.tone}
${campaign.era ? `Era: ${campaign.era}` : ''}

Create a SIMPLE opening that presents ONE clear challenge the leader must address. Examples:
- Economic crisis (recession, inflation)
- Social unrest (strike, protests)
- Diplomatic tension (border dispute, trade)
- Natural disaster or pandemic
- Political instability (election, scandal)

The narrative should:
- Be SHORT: 1–2 paragraphs only. Simple, direct language.
- Present ONE clear situation requiring a decision
- Avoid long setups. Get to the point quickly.
- End with a brief question inviting the player to decide

Return ONLY valid JSON (no markdown, no code blocks):
{
  "openingNarrative": "Your narrative text in ${languageName}..."
}`;

  const userPrompt = `Generate an opening scenario for: ${campaign.title}

Nation: ${campaign.nation}
Theme: ${campaign.theme}
Tone: ${campaign.tone}`;

  try {
    const response = await client.sendMessageSync(systemPrompt, [
      { role: 'user', content: userPrompt },
    ]);

    let jsonText = response;
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as ScenarioGenerationResult;

    if (!parsed.openingNarrative) {
      throw new Error('AI response missing openingNarrative');
    }

    return parsed;
  } catch (error) {
    console.error('Scenario generation failed:', error);
    return getFallbackScenario(campaign, languageName);
  }
}

function getFallbackScenario(campaign: Campaign, languageName: string): ScenarioGenerationResult {
  const fallbacks: Record<string, ScenarioGenerationResult> = {
    en: {
      openingNarrative: `You have just taken office as the leader of ${campaign.nation}. Your first cabinet meeting is interrupted by urgent news: a major strike has paralyzed the capital. Workers demand wage increases and better conditions. The opposition is calling for your resignation. Business leaders warn of economic collapse if you give in.

The streets are filled with protesters. The media is watching your every move. You must decide how to respond. Will you negotiate, crack down, or seek a third way?`,
    },
    pt: {
      openingNarrative: `Você acabou de assumir o cargo de líder de ${campaign.nation}. Sua primeira reunião de gabinete é interrompida por notícias urgentes: uma greve geral paralisou a capital. Os trabalhadores exigem aumentos salariais e melhores condições. A oposição pede sua renúncia. Líderes empresariais alertam sobre colapso econômico se você ceder.

As ruas estão cheias de manifestantes. A mídia observa cada movimento seu. Você deve decidir como responder.`,
    },
    es: {
      openingNarrative: `Acabas de asumir el cargo de líder de ${campaign.nation}. Tu primera reunión de gabinete es interrumpida por noticias urgentes: una huelga general ha paralizado la capital. Los trabajadores exigen aumentos salariales y mejores condiciones. La oposición pide tu renuncia.

Las calles están llenas de manifestantes. Los medios observan cada movimiento. Debes decidir cómo responder.`,
    },
  };

  return fallbacks[languageName] || fallbacks.en;
}
