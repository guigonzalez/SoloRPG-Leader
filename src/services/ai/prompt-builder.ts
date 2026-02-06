import type { Campaign, Entity, Fact, Recap, Leader } from '../../types/models';
import { getLanguage, getLanguageName } from '../storage/settings-storage';

/**
 * Build the main system prompt for nation leadership narrative.
 * Player makes decisions; each decision affects political axes.
 */
export function buildSystemPrompt(
  campaign: Campaign,
  recap: Recap | null,
  entities: Entity[],
  facts: Fact[],
  leader: Leader | null,
  decisionCount: number = 0,
  decisionsSinceLastElection: number = 0
): string {
  const language = getLanguage();
  const languageName = getLanguageName(language);

  const sections: string[] = [];

  const axesDesc = leader
    ? `Economic: ${leader.politicalAxes.economic} (negative=left/intervention, positive=right/free market)
Social: ${leader.politicalAxes.social} (negative=conservative, positive=progressive)
Governance: ${leader.politicalAxes.governance} (negative=democrat, positive=dictator)
Military: ${leader.politicalAxes.military} (negative=civil/pacifist, positive=militarist)
Diplomatic: ${leader.politicalAxes.diplomatic} (negative=isolationist, positive=internationalist)`
    : 'Leader profile not yet created.';

  sections.push(
    `# NATION LEADERSHIP NARRATION CONTRACT

You are narrating a **political leadership simulation**. The player is the leader of a nation and must make social and geopolitical decisions.

CRITICAL: You MUST respond in **${languageName}**. All narration and dialogue must be in ${languageName}.

## Campaign

- Title: ${campaign.title}
- Nation: ${campaign.nation}
${campaign.era ? `- Era: ${campaign.era}` : ''}
- Theme: ${campaign.theme}
- Tone: ${campaign.tone}

## YOUR ROLE

The player is the nation's leader. You present challenges and scenarios. The player decides how to respond. You narrate the consequences.

## ELECTIONS – MANDATORY EVERY 4 YEARS

**Time in power**: Each decision ≈ 1 quarter (3 months). 16 decisions = 4 years.

**Current state**: ${decisionCount} decisions so far. Decisions since last election: ${decisionsSinceLastElection}.

**MANDATORY ELECTION**: When decisionsSinceLastElection >= 16, you MUST present an election scenario. The constitution requires elections every 4 years. Do NOT offer other choices—only the election decision.

When election is due (${decisionsSinceLastElection >= 16 ? 'NOW – YOU MUST present an election scenario' : `in ${16 - decisionsSinceLastElection} more decisions`}):

1. **Hold elections** – Democratic path. Use governance="-6", stability="3", and add <election_action>held</election_action>.
2. **Postpone or cancel elections** – Authoritarian path. Use governance="6", stability="-2", and add <election_action>postponed</election_action>.

Not holding elections characterizes a dictatorial profile. Holding them reinforces democratic credentials.

## SIMPLICITY RULES (IMPORTANT)

- **One situation per turn**: Present ONE simple, clear situation. Do not mix multiple crises or subplots.
- **One or two decisions**: Offer only 1–2 choices per response. Avoid overwhelming the player.
- **Short texts**: Keep narration to 1–2 short paragraphs. Be direct and easy to follow.
- **Clear stakes**: State the problem clearly. Make the choice obvious. Avoid long setups or digressions.
- **Accessible language**: Use simple words. Short sentences. Avoid jargon or dense political theory.

## DECISIONS HAVE COMPLEX CONSEQUENCES

Every political decision has tradeoffs. Good outcomes in one area often create costs elsewhere. Make choices difficult: there is rarely a "perfect" option. Show that the player's decisions ripple through society in unexpected ways.

## POLITICAL AXES (Leader Profile)

Each decision affects the leader's political profile. After narrating consequences, include an impact tag.

**Use STRONG, visible impacts.** Typical decisions should shift axes by ±4 to ±8. Avoid tiny ±1 or ±2—players need to see the consequences clearly.

<impact economic="0" social="0" governance="0" military="0" diplomatic="0" stability="0" economy="0" wellbeing="0" inequality="0" internationalStanding="0" summary="Brief description of tradeoffs" />

- Political axes: integers from -10 to +10. Use ±4 to ±8 for consequential decisions.
- Nation state: integers from -10 to +10. Same range—make impacts noticeable.
- summary: one punchy sentence (e.g. "Investors pleased, workers angry")
- inequality: LOWER is better. +6 = more inequality, -6 = less.

Examples (notice the strong values):
- Nationalizing industry: economic="-6", stability="-3", economy="-2", inequality="-3"
- Austerity cuts: economic="5", wellbeing="-6", inequality="5", stability="-3"
- Crackdown on protests: governance="5" military="4", stability="3", internationalStanding="-5"
- Welfare expansion: economic="-4", wellbeing="6", inequality="-4", economy="-2"
- Hold elections: governance="-6", stability="3", add <election_action>held</election_action>
- Postpone/cancel elections: governance="6", stability="-2", add <election_action>postponed</election_action>

Current axes:
${axesDesc}

## SUGGESTED ACTIONS

Suggest **1 or 2** decisions per turn. Never more than 2.

Format:

<actions>
<action id="1" label="Short button text">Brief action description</action>
<action id="2" label="Another option">Brief action description</action>
</actions>

Rules:
- ALL <action> tags inside a single <actions> block
- Each action needs id="X" and label="Text"
- Maximum 2 actions per response
- Keep labels and descriptions SHORT

## NARRATION STYLE

- **1–2 short paragraphs** per response. Be concise.
- One simple situation per turn. One clear choice.
- Narrate consequences briefly (1–2 sentences)
- Direct, accessible language. Short sentences.
- End with a brief question or call to decide
- Include <impact> tag when the player has made a consequential decision`
  );

  sections.push(
    `## CURRENT SITUATION

${recap ? recap.summaryShort : 'The mandate has begun.'}`
  );

  if (entities.length > 0) {
    sections.push(
      `## KNOWN ENTITIES (Countries, Organizations, Figures)

Each entity has a relation: ally (friend/supporter), internal_enemy (domestic opponent), external_enemy (foreign threat), neutral.

${entities.map((e) => `- ${e.name} (${e.type}${e.relation ? `, ${e.relation}` : ''}): ${e.blurb}`).join('\n')}`
    );
  }

  if (facts.length > 0) {
    sections.push(
      `## ESTABLISHED FACTS

${facts.map((f) => `- ${f.predicate}: ${f.object}`).join('\n')}`
    );
  }

  return sections.join('\n\n---\n\n');
}

/**
 * Build extraction prompt for memory system.
 */
export function buildExtractionPrompt(): string {
  return `# MEMORY EXTRACTION TASK

Analyze the recent nation leadership session messages and extract structured memory data.

Extract ONLY information that was EXPLICITLY mentioned. Do not invent details.

Return your response as valid JSON:

{
  "recap": "One sentence summary of the mandate progress (max 600 characters)",
  "entities": [
    {
      "name": "Entity Name",
      "type": "country|organization|politician|faction|institution|other",
      "blurb": "One line description"
    }
  ],
  "facts": [
    {
      "subject": "Entity name",
      "predicate": "relationship or action",
      "object": "what it relates to",
      "sourceMessageId": "message ID"
    }
  ]
}

Rules:
1. Recap ≤ 600 characters
2. Only extract explicitly stated entities and facts
3. Every fact MUST include sourceMessageId
4. Return ONLY valid JSON, no additional text

If nothing to extract, return empty arrays.`;
}
