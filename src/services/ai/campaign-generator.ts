import { getClaudeClient } from './claude-client';
import { getGeminiClient } from './gemini-client';
import { getAIProvider } from '../storage/api-key-storage';
import { getLanguage, getLanguageName } from '../storage/settings-storage';

/**
 * Campaign suggestion result
 */
export interface CampaignSuggestion {
  title: string;
  theme: string;
  tone: string;
  nation?: string;
}

/**
 * Generate campaign suggestions based on RPG system
 */
export async function generateCampaignSuggestion(
  system: string
): Promise<CampaignSuggestion> {
  const provider = getAIProvider();
  const language = getLanguage();
  const languageName = getLanguageName(language);

  // Get appropriate client
  const client = provider === 'gemini' ? getGeminiClient() : getClaudeClient();

  const systemPrompt = `You are a creative RPG campaign designer.

IMPORTANT: You MUST generate the campaign in ${languageName}. Title, theme, and tone must all be in ${languageName}.

Your task is to generate an exciting campaign idea for ${system}.

Generate ONE unique campaign concept that fits the system's themes and mechanics.

RULES:
- Be creative and original
- Make it exciting and engaging
- Keep it concise
- Match the system's typical themes and tone
- Title should be catchy (max 60 characters)
- Theme should describe the setting and key elements (max 180 characters)
- Tone should be 1-3 words describing the mood
- ALL content must be in ${languageName}

OUTPUT FORMAT - Respond with ONLY valid JSON (no markdown, no code blocks):
{
  "title": "Campaign Title in ${languageName}",
  "theme": "Description of setting, world, and key story elements in ${languageName}",
  "tone": "Mood descriptor in ${languageName}"
}

IMPORTANT: Return ONLY the JSON object, nothing else. Do not wrap it in code blocks or markdown.`;

  try {
    const response = await client.sendMessageSync(
      systemPrompt,
      [{ role: 'user', content: `Generate a campaign idea for ${system}` }]
    );

    // Parse JSON response - handle markdown code blocks
    let jsonText = response;

    // Remove markdown code block markers if present
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // Extract JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', response);
      throw new Error('Failed to extract JSON from AI response');
    }

    const suggestion: CampaignSuggestion = JSON.parse(jsonMatch[0]);

    // Validate and truncate if needed
    if (suggestion.title && suggestion.title.length > 60) {
      suggestion.title = suggestion.title.substring(0, 57) + '...';
    }
    if (suggestion.theme && suggestion.theme.length > 180) {
      suggestion.theme = suggestion.theme.substring(0, 177) + '...';
    }

    return suggestion;
  } catch (error) {
    console.error('Campaign generation failed:', error);
    // Return fallback suggestion
    return getFallbackSuggestion(system);
  }
}

/**
 * Get fallback suggestion if AI generation fails
 */
function getFallbackSuggestion(system: string): CampaignSuggestion {
  const fallbacks: Record<string, CampaignSuggestion> = {
    'D&D 5e': {
      title: 'The Forgotten Ruins',
      theme: 'Ancient dungeons hide secrets of a lost civilization. Magic runs wild, and dark forces stir beneath the earth.',
      tone: 'Heroic, adventurous'
    },
    'Pathfinder 2e': {
      title: 'Crown of Shadows',
      theme: 'A cursed kingdom needs heroes to break an ancient curse. Political intrigue meets dungeon exploration.',
      tone: 'Epic, mysterious'
    },
    'Call of Cthulhu': {
      title: 'The Arkham Files',
      theme: 'Strange disappearances in 1920s New England lead to eldritch horrors and cosmic truths beyond comprehension.',
      tone: 'Horror, investigative'
    },
    'Cyberpunk RED': {
      title: 'Neon Ghosts',
      theme: 'Corporate espionage in Night City. Hackers, mercs, and rebels fight for survival in the chrome and shadows.',
      tone: 'Gritty, noir'
    },
    'Vampire: The Masquerade': {
      title: 'Blood and Politics',
      theme: 'Navigate vampire society politics while maintaining the Masquerade. Ancient bloodlines clash in modern nights.',
      tone: 'Dark, intrigue'
    },
    'Generic/Freeform': {
      title: 'The Journey Begins',
      theme: 'A classic adventure awaits. Heroes rise, challenges appear, and destinies are forged.',
      tone: 'Adventurous'
    }
  };

  return fallbacks[system] || fallbacks['Generic/Freeform'];
}

/**
 * Generate mystery campaign suggestion for detective game
 */
export async function generateMysterySuggestion(
  style: string
): Promise<CampaignSuggestion> {
  const provider = getAIProvider();
  const language = getLanguage();
  const languageName = getLanguageName(language);

  const client = provider === 'gemini' ? getGeminiClient() : getClaudeClient();

  const styleDescriptions: Record<string, string> = {
    christie: 'Agatha Christie style - manor, country house, wealthy family, elegant suspense',
    holmes: 'Sherlock Holmes style - Victorian London, fog, deductive reasoning',
    express: 'Orient Express style - luxury train, confined space, passengers with secrets',
    rural: 'Rural mystery - small village, tight-knit community, old grudges',
    noir: 'Detective noir - 1940s city, shadows, cynical detective, femme fatale',
  };

  const styleDesc = styleDescriptions[style] || styleDescriptions.christie;

  const systemPrompt = `You are a mystery writer in the style of Agatha Christie and Arthur Conan Doyle.

IMPORTANT: You MUST generate in ${languageName}. Title, theme, and tone must all be in ${languageName}.

Generate ONE murder mystery case concept. Style: ${styleDesc}).

RULES:
- Title: catchy, max 60 chars (e.g. "Murder at Blackwood Hall")
- Theme: setting, victim, key suspects, 1-2 sentences, max 200 chars
- Tone: 1-3 words (e.g. "Elegant, suspenseful")
- ALL content in ${languageName}

OUTPUT FORMAT - Respond with ONLY valid JSON (no markdown):
{
  "title": "Campaign Title",
  "theme": "Description...",
  "tone": "Mood descriptor"
}`;

  try {
    const response = await client.sendMessageSync(
      systemPrompt,
      [{ role: 'user', content: `Generate a mystery for style: ${style}` }]
    );

    let jsonText = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const jsonMatch = jsonText.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error('Failed to extract JSON');

    const suggestion: CampaignSuggestion = JSON.parse(jsonMatch[0]);

    if (suggestion.title && suggestion.title.length > 60) {
      suggestion.title = suggestion.title.substring(0, 57) + '...';
    }
    if (suggestion.theme && suggestion.theme.length > 200) {
      suggestion.theme = suggestion.theme.substring(0, 197) + '...';
    }

    return suggestion;
  } catch (error) {
    console.error('Mystery generation failed:', error);
    return getMysteryFallback(style);
  }
}

function getMysteryFallback(style: string): CampaignSuggestion {
  const fallbacks: Record<string, CampaignSuggestion> = {
    christie: { title: 'Murder at the Manor', theme: 'A lord is found dead. The family has gathered. The butler knows something.', tone: 'Elegant, suspenseful' },
    holmes: { title: 'The London Case', theme: 'Strange disappearances in Victorian London. Fog, gas lamps, and a detective with a keen eye.', tone: 'Deductive, atmospheric' },
    express: { title: 'Crime on the Express', theme: 'A murder on a luxury train. The killer is among the passengers. Everyone has a secret.', tone: 'Claustrophobic, tense' },
    rural: { title: 'The Valley Case', theme: 'A body in the barn. Old grudges, land disputes, and a village where everyone knows everyone.', tone: 'Quiet, unsettling' },
    noir: { title: 'Detective Noir', theme: '1940s city. A dame walks in. A man is dead. Shadows and cigarettes.', tone: 'Gritty, cynical' },
  };
  return fallbacks[style] || fallbacks.christie;
}

/**
 * Generate scenario suggestion for nation leadership game
 */
export async function generateScenarioSuggestion(
  style: string
): Promise<CampaignSuggestion> {
  const provider = getAIProvider();
  const language = getLanguage();
  const languageName = getLanguageName(language);

  const client = provider === 'gemini' ? getGeminiClient() : getClaudeClient();

  const styleDescriptions: Record<string, string> = {
    economic: 'Economic crisis - recession, unemployment, austerity vs stimulus',
    war: 'Military conflict - border crisis, invasion threat, diplomacy or war',
    pandemic: 'Health crisis - virus, lockdowns, science vs economy',
    election: 'Political - tight polls, scandals, campaign strategy',
    diplomatic: 'International - trade war, summit, treaties',
    social: 'Civil unrest - strikes, protests, reform or repression',
    military: 'Defense - coup plot, draft, military expansion',
  };

  const styleDesc = styleDescriptions[style] || styleDescriptions.economic;

  const systemPrompt = `You are a political drama writer creating scenarios for a nation leadership game.

IMPORTANT: You MUST generate in ${languageName}. Title, nation, theme, and tone must all be in ${languageName}.

Generate ONE political scenario concept. Type: ${styleDesc}

RULES:
- Title: catchy, max 60 chars (e.g. "The Recession")
- Nation: fictional country name (e.g. "Democratic Republic")
- Theme: the crisis/situation in 1-2 sentences, max 200 chars
- Tone: 1-3 words (e.g. "Urgent, tense")
- ALL content in ${languageName}

OUTPUT FORMAT - Respond with ONLY valid JSON (no markdown):
{
  "title": "Scenario Title",
  "nation": "Country Name",
  "theme": "Description...",
  "tone": "Mood descriptor"
}`;

  try {
    const response = await client.sendMessageSync(
      systemPrompt,
      [{ role: 'user', content: `Generate a scenario for type: ${style}` }]
    );

    let jsonText = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const jsonMatch = jsonText.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) throw new Error('Failed to extract JSON');

    const suggestion: CampaignSuggestion = JSON.parse(jsonMatch[0]);

    if (suggestion.title && suggestion.title.length > 60) {
      suggestion.title = suggestion.title.substring(0, 57) + '...';
    }
    if (suggestion.theme && suggestion.theme.length > 200) {
      suggestion.theme = suggestion.theme.substring(0, 197) + '...';
    }

    return suggestion;
  } catch (error) {
    console.error('Scenario generation failed:', error);
    return getScenarioFallback(style);
  }
}

function getScenarioFallback(style: string): CampaignSuggestion {
  const fallbacks: Record<string, CampaignSuggestion> = {
    economic: { title: 'The Recession', nation: 'Democratic Republic', theme: 'Economic crisis. Unemployment rising. Banks failing. The people demand action.', tone: 'Urgent, tense' },
    war: { title: 'The Border Crisis', nation: 'Northern Kingdom', theme: 'A neighboring nation threatens invasion. Troops at the border. Diplomacy or war?', tone: 'Military, decisive' },
    pandemic: { title: 'The Pandemic', nation: 'Eastern Federation', theme: 'A deadly virus spreads. Hospitals overflow. Lockdown or freedom?', tone: 'Crisis, moral' },
    election: { title: 'Election Year', nation: 'United States', theme: 'Polls are tight. Scandals surface. Will you play dirty or take the high road?', tone: 'Political, strategic' },
    diplomatic: { title: 'The Trade War', nation: 'Western Alliance', theme: 'Tariffs escalate. Allies pressure. Domestic industry demands protection.', tone: 'Diplomatic, economic' },
    social: { title: 'The Strike', nation: 'Central Confederation', theme: 'Workers paralyze the capital. Business demands crackdown. Choose your side.', tone: 'Social, divisive' },
    military: { title: 'The Coup Plot', nation: 'Southern Republic', theme: 'Intelligence reports a conspiracy. Trust the military or purge the ranks?', tone: 'Dark, paranoid' },
  };
  return fallbacks[style] || fallbacks.economic;
}
