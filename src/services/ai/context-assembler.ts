import type { Message, SuggestedAction, DecisionImpact, NationStateImpact } from '../../types/models';
import type { ClaudeMessage } from '../../types/api';

/**
 * Assemble conversation context for Claude API
 * Takes recent messages and converts to Claude format
 */
export function assembleContext(messages: Message[]): ClaudeMessage[] {
  // Take last 20 messages for context (to stay within token limits)
  const recentMessages = messages.slice(-20);

  const claudeMessages: ClaudeMessage[] = [];

  for (const message of recentMessages) {
    // Skip system messages (they're not part of user/AI conversation)
    if (message.role === 'system') {
      continue;
    }

    // Convert to Claude format
    claudeMessages.push({
      role: message.role === 'user' ? 'user' : 'assistant',
      content: message.content,
    });
  }

  // Claude API requires messages to alternate user/assistant
  // and start with user message
  return ensureAlternatingMessages(claudeMessages);
}

/**
 * Ensure messages alternate between user and assistant
 * Claude API requirement
 */
function ensureAlternatingMessages(messages: ClaudeMessage[]): ClaudeMessage[] {
  // If no messages, start with a default user message
  if (messages.length === 0) {
    return [
      {
        role: 'user',
        content: 'Begin the adventure.',
      },
    ];
  }

  const result: ClaudeMessage[] = [];
  let lastRole: 'user' | 'assistant' | null = null;

  for (const message of messages) {
    // If same role as last message, merge them
    if (lastRole === message.role && result.length > 0) {
      const last = result[result.length - 1];
      last.content += '\n\n' + message.content;
    } else {
      result.push({ ...message });
      lastRole = message.role;
    }
  }

  // Ensure it starts with user message
  if (result.length > 0 && result[0].role !== 'user') {
    result.unshift({
      role: 'user',
      content: '[Conversation started]',
    });
  }

  return result;
}

/**
 * Parse roll request from AI response
 * Looks for patterns like "Roll to X. (DC: 15)" or "Roll d20" (English/Portuguese)
 */
export function parseRollRequest(content: string): string | null {
  // Pattern 1: "Roll to [action]. (DC: X)" or "role [dice] para [action]. (DC: X)"
  const dcPattern = /(Roll to [^.]+\.|role \d*d\d+ para [^.]+\.)\s*\(DC:\s*\d+\)/i;
  if (dcPattern.test(content)) {
    // Extract dice notation if present (e.g., "role 1d20 para")
    const diceMatch = content.match(/role\s+(\d*d\d+)/i);
    if (diceMatch) {
      return diceMatch[1];
    }
    return 'd20';
  }

  // Pattern 2: "Roll d20" or "Roll 1d20" or "role d20" or "role 1d20"
  const dicePattern = /(Roll|role)\s+(\d*d\d+(?:[+-]\d+)?)/i;
  const match = content.match(dicePattern);
  if (match) {
    return match[2];
  }

  // Pattern 3: Check if "roll"/"role" appears in last paragraph with DC mention
  const paragraphs = content.split('\n\n');
  const lastParagraph = paragraphs[paragraphs.length - 1] || '';

  if (/(roll|role)/i.test(lastParagraph) && /DC/i.test(lastParagraph)) {
    // Try to extract dice notation
    const diceMatch = lastParagraph.match(/(\d*d\d+)/i);
    if (diceMatch) {
      return diceMatch[1];
    }
    return 'd20';
  }

  return null;
}

/**
 * Parse XP change from AI response (gain or loss)
 * Extracts <xp>X</xp> or <xp>-X</xp> tags
 */
export function parseXPAward(content: string): {
  cleanContent: string;
  xpAmount: number | null;
} {
  const xpMatch = content.match(/<xp>([+-]?\d+)<\/xp>/i);
  if (!xpMatch) {
    return { cleanContent: content, xpAmount: null };
  }

  const xpAmount = parseInt(xpMatch[1], 10);
  const cleanContent = content.replace(/<xp>[+-]?\d+<\/xp>/gi, '').trim();
  return { cleanContent, xpAmount };
}

/** Election action for timeline: held = democratic, postponed = authoritarian */
export type ElectionAction = 'held' | 'postponed';

/**
 * Parse election action from AI response (Leader game)
 * Format: <election_action>held</election_action> or <election_action>postponed</election_action>
 */
export function parseElectionAction(content: string): {
  cleanContent: string;
  electionAction: ElectionAction | null;
} {
  const match = content.match(/<election_action>(held|postponed)<\/election_action>/i);
  if (!match) {
    return { cleanContent: content, electionAction: null };
  }
  const electionAction = match[1].toLowerCase() as ElectionAction;
  const cleanContent = content.replace(/<election_action>(held|postponed)<\/election_action>/gi, '').trim();
  return { cleanContent, electionAction };
}

/**
 * Parse suggested actions from AI response
 * Extracts action tags and returns clean content + actions
 */
export function parseSuggestedActions(content: string): {
  cleanContent: string;
  actions: SuggestedAction[];
  impact?: import('../../types/models').DecisionImpact | null;
  nationImpact?: import('../../types/models').NationStateImpact | null;
  impactSummary?: string | null;
  electionAction?: ElectionAction | null;
} {
  const actions: SuggestedAction[] = [];
  let cleanContent = content;

  // Match <actions>...</actions> block
  const actionsBlockMatch = content.match(/<actions>([\s\S]*?)<\/actions>/i);

  if (!actionsBlockMatch) {
    const impactResult = parseImpact(cleanContent);
    const electionResult = parseElectionAction(impactResult.cleanContent);
    return {
      cleanContent: electionResult.cleanContent,
      actions: [],
      impact: impactResult.impact,
      nationImpact: impactResult.nationImpact,
      impactSummary: impactResult.impactSummary,
      electionAction: electionResult.electionAction ?? undefined,
    };
  }

  const actionsBlock = actionsBlockMatch[1];

  // Extract individual <action> tags
  const actionRegex = /<action\s+id="([^"]+)"\s+label="([^"]+)"(?:\s+roll="([^"]+)")?(?:\s+dc="([^"]+)")?>([^<]+)<\/action>/gi;

  let match;
  while ((match = actionRegex.exec(actionsBlock)) !== null) {
    const [, id, label, roll, dc, action] = match;

    actions.push({
      id,
      label: label.trim(),
      action: action.trim(),
      rollNotation: roll?.trim(),
      dc: dc ? parseInt(dc, 10) : undefined,
    });
  }

  // Remove <actions> block from content
  cleanContent = content.replace(/<actions>[\s\S]*?<\/actions>/i, '').trim();

  // Also remove any stray <action> tags that appear outside <actions> blocks
  cleanContent = cleanContent.replace(/<action\s+[^>]*>[\s\S]*?<\/action>/gi, '').trim();

  // Parse and remove <impact> tag (Leader game)
  const impactResult = parseImpact(cleanContent);
  const electionResult = parseElectionAction(impactResult.cleanContent);

  return {
    cleanContent: electionResult.cleanContent,
    actions,
    impact: impactResult.impact,
    nationImpact: impactResult.nationImpact,
    impactSummary: impactResult.impactSummary,
    electionAction: electionResult.electionAction ?? undefined,
  };
}

/**
 * Parse decision impact from AI response (Leader game)
 * Format: <impact economic="5" social="-3" stability="-2" economy="3" wellbeing="-1" inequality="2" internationalStanding="0" />
 * Optional: <impact ... summary="Brief description of tradeoffs" />
 */
export function parseImpact(content: string): {
  cleanContent: string;
  impact: DecisionImpact | null;
  nationImpact?: NationStateImpact | null;
  impactSummary?: string | null;
} {
  const impactMatch = content.match(/<impact\s+([^>]*)\s*\/?>/i);
  if (!impactMatch) {
    return { cleanContent: content, impact: null };
  }

  const attrs = impactMatch[1];
  const impact: DecisionImpact = {};
  const nationImpact: NationStateImpact = {};

  const parseAttr = (name: string): number | undefined => {
    const m = attrs.match(new RegExp(`${name}="([^"]*)"`, 'i'));
    return m?.[1] ? parseInt(m[1], 10) : undefined;
  };

  const economic = parseAttr('economic');
  const social = parseAttr('social');
  const governance = parseAttr('governance');
  const military = parseAttr('military');
  const diplomatic = parseAttr('diplomatic');
  if (economic != null) impact.economic = economic;
  if (social != null) impact.social = social;
  if (governance != null) impact.governance = governance;
  if (military != null) impact.military = military;
  if (diplomatic != null) impact.diplomatic = diplomatic;

  const stability = parseAttr('stability');
  const economy = parseAttr('economy');
  const wellbeing = parseAttr('wellbeing');
  const inequality = parseAttr('inequality');
  const internationalStanding = parseAttr('internationalStanding');
  if (stability != null) nationImpact.stability = stability;
  if (economy != null) nationImpact.economy = economy;
  if (wellbeing != null) nationImpact.wellbeing = wellbeing;
  if (inequality != null) nationImpact.inequality = inequality;
  if (internationalStanding != null) nationImpact.internationalStanding = internationalStanding;

  const summaryMatch = attrs.match(/summary="([^"]*)"/i);
  const impactSummary = summaryMatch?.[1]?.trim() || null;

  const hasPolitical = Object.keys(impact).length > 0;
  const hasNation = Object.keys(nationImpact).length > 0;
  const cleanContent = content.replace(/<impact\s+[^>]*\s*\/?>/gi, '').trim();

  return {
    cleanContent,
    impact: hasPolitical ? impact : null,
    nationImpact: hasNation ? nationImpact : null,
    impactSummary,
  };
}

/**
 * HP/Resource effect interface
 */
export interface CharacterEffect {
  type: 'damage' | 'damage_roll' | 'heal';
  amount: number;
  rollNotation?: string;
}

/**
 * Parse character effects from AI response
 * Extracts HP damage/healing and resource management tags
 *
 * Supported tags:
 * - <damage>X</damage> - Apply X damage to character (armor reduces)
 * - <damage_roll>2d6</damage_roll> - Roll dice for damage, system applies (armor reduces)
 * - <heal>X</heal> - Restore X HP to character
 */
export function parseCharacterEffects(content: string): {
  cleanContent: string;
  effects: CharacterEffect[];
} {
  const effects: CharacterEffect[] = [];
  let cleanContent = content;

  // Parse <damage>X</damage>
  const damageRegex = /<damage>(\d+)<\/damage>/gi;
  let damageMatch;
  while ((damageMatch = damageRegex.exec(content)) !== null) {
    effects.push({
      type: 'damage',
      amount: parseInt(damageMatch[1], 10),
    });
  }
  cleanContent = cleanContent.replace(damageRegex, '').trim();

  // Parse <damage_roll>2d6</damage_roll> or <damage_roll>1d8+2</damage_roll>
  const damageRollRegex = /<damage_roll>([^<]+)<\/damage_roll>/gi;
  let damageRollMatch;
  while ((damageRollMatch = damageRollRegex.exec(content)) !== null) {
    const notation = damageRollMatch[1].trim();
    if (/^\d*d\d+([+-]\d+)?$/i.test(notation)) {
      effects.push({
        type: 'damage_roll',
        amount: 0,
        rollNotation: notation,
      });
    }
  }
  cleanContent = cleanContent.replace(damageRollRegex, '').trim();

  // Parse <heal>X</heal>
  const healRegex = /<heal>(\d+)<\/heal>/gi;
  let healMatch;
  while ((healMatch = healRegex.exec(content)) !== null) {
    effects.push({
      type: 'heal',
      amount: parseInt(healMatch[1], 10),
    });
  }
  cleanContent = cleanContent.replace(healRegex, '').trim();

  return { cleanContent, effects };
}

/**
 * Item drop interface - items the AI grants to the player
 */
export interface ItemDrop {
  itemId: string;
  quantity: number;
}

/**
 * Parse item drops from AI response
 * Format: <item_drop id="healing_potion" qty="2"/>
 * or <item_drop id="healing_potion">2</item_drop>
 */
export function parseItemDrops(content: string): {
  cleanContent: string;
  drops: ItemDrop[];
} {
  const drops: ItemDrop[] = [];
  let cleanContent = content;

  // Format 1: <item_drop id="healing_potion" qty="2"/>
  const selfClosingRegex = /<item_drop\s+id="([^"]+)"\s+qty="(\d+)"\s*\/>/gi;
  let match;
  while ((match = selfClosingRegex.exec(content)) !== null) {
    drops.push({
      itemId: match[1],
      quantity: parseInt(match[2], 10),
    });
  }
  cleanContent = cleanContent.replace(selfClosingRegex, '').trim();

  // Format 2: <item_drop id="healing_potion">2</item_drop>
  const blockRegex = /<item_drop\s+id="([^"]+)">(\d+)<\/item_drop>/gi;
  while ((match = blockRegex.exec(content)) !== null) {
    drops.push({
      itemId: match[1],
      quantity: parseInt(match[2], 10),
    });
  }
  cleanContent = cleanContent.replace(blockRegex, '').trim();

  return { cleanContent, drops };
}


