import { getClaudeClient } from './claude-client';
import { getGeminiClient } from './gemini-client';
import { getAIProvider } from '../storage/api-key-storage';
import { getLanguage } from '../storage/settings-storage';
import type { MysteryAnswer } from '../../types/models';

export interface ArrestGuess {
  criminal: string;
  weapon: string;
  motive: string;
}

export interface ArrestVerificationResult {
  correct: boolean;
  narrative: string;
}

/**
 * Ask the AI to verify the player's arrest guess against the secret answer.
 * The AI acts as judge and generates appropriate narrative (victory or penalty).
 */
export async function verifyArrest(
  secret: MysteryAnswer,
  guess: ArrestGuess,
  attemptsRemaining: number,
  languageName: string
): Promise<ArrestVerificationResult> {
  const provider = getAIProvider();
  const client = provider === 'gemini' ? getGeminiClient() : getClaudeClient();

  const systemPrompt = `You are the judge of a detective mystery game. You know the correct solution. The player has made an accusation.

CORRECT ANSWER (do NOT reveal to the player in your response):
- Criminal: ${secret.criminal}
- Weapon: ${secret.weapon}
- Motive: ${secret.motive}

PLAYER'S ACCUSATION:
- Suspect: ${guess.criminal}
- Weapon: ${guess.weapon}
- Motive: ${guess.motive}

You must determine if the player's accusation is CORRECT. Be lenient with matching:
- "The butler" matches "James, the butler" or "the butler"
- "Candlestick" matches "a candlestick" or "the candlestick"
- Minor wording variations should count as correct if the meaning is the same

Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "correct": true or false,
  "narrative": "Your narrative in ${languageName}. If correct: describe the triumphant moment, the culprit's reaction, the case closed. If wrong: describe the failed accusation, the consequences (e.g. wrong person released, reputation damaged), the criminal still at large. Do NOT reveal the actual criminal/weapon/motive when wrong. Keep it 2-3 paragraphs."
}`;

  const userPrompt = `Verify this accusation. Is it correct?`;

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

    const parsed = JSON.parse(jsonMatch[0]) as ArrestVerificationResult;

    if (typeof parsed.correct !== 'boolean' || !parsed.narrative) {
      throw new Error('AI response missing required fields');
    }

    return parsed;
  } catch (error) {
    console.error('Arrest verification failed:', error);
    // Fallback: do simple string comparison
    const normalized = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');
    const criminalMatch = normalized(guess.criminal).includes(normalized(secret.criminal)) ||
      normalized(secret.criminal).includes(normalized(guess.criminal));
    const weaponMatch = normalized(guess.weapon).includes(normalized(secret.weapon)) ||
      normalized(secret.weapon).includes(normalized(guess.weapon));
    const motiveMatch = normalized(guess.motive).includes(normalized(secret.motive)) ||
      normalized(secret.motive).includes(normalized(guess.motive));

    const correct = criminalMatch && weaponMatch && motiveMatch;

    const lang = getLanguage();
    const fallbackNarrative = correct
      ? (lang === 'pt' ? 'Você acertou! O culpado é preso e o caso é encerrado.' :
          lang === 'es' ? '¡Correcto! El culpable es arrestado y el caso se cierra.' :
          'You got it right! The culprit is arrested and the case is closed.')
      : (lang === 'pt' ? `Sua acusação estava incorreta. ${attemptsRemaining > 0 ? `Você tem ${attemptsRemaining} tentativa(s) restante(s).` : 'O criminoso escapou. O caso permanece em aberto.'}` :
          lang === 'es' ? `Tu acusación era incorrecta. ${attemptsRemaining > 0 ? `Te quedan ${attemptsRemaining} intento(s).` : 'El criminal escapó. El caso sigue abierto.'}` :
          `Your accusation was wrong. ${attemptsRemaining > 0 ? `You have ${attemptsRemaining} attempt(s) remaining.` : 'The criminal has escaped. The case remains unsolved.'}`);

    return { correct, narrative: fallbackNarrative };
  }
}
