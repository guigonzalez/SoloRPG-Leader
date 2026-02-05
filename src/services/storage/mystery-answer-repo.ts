import { getDB } from './db';
import type { MysteryAnswer } from '../../types/models';

export async function getMysteryAnswerByCampaign(campaignId: string): Promise<MysteryAnswer | null> {
  const db = await getDB();
  const answer = await db.get('mystery_answers', campaignId);
  if (answer && answer.attemptsUsed === undefined) {
    answer.attemptsUsed = 0;
    await saveMysteryAnswer(answer);
  }
  return answer ?? null;
}

export async function saveMysteryAnswer(answer: MysteryAnswer): Promise<void> {
  const db = await getDB();
  await db.put('mystery_answers', answer);
}

export async function incrementArrestAttempts(campaignId: string): Promise<number> {
  const answer = await getMysteryAnswerByCampaign(campaignId);
  if (!answer) return 3;
  answer.attemptsUsed = (answer.attemptsUsed ?? 0) + 1;
  await saveMysteryAnswer(answer);
  return answer.attemptsUsed;
}
