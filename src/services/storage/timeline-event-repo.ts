import { getDB } from './db';
import { generateId } from '../../utils/id';
import type { TimelineEvent, NewTimelineEvent } from '../../types/models';

/**
 * Timeline event repository - journey milestones for the mandate
 */

export async function getTimelineEventsByCampaign(
  campaignId: string
): Promise<TimelineEvent[]> {
  const db = await getDB();
  const index = db.transaction('timelineEvents').store.index('campaignCreatedAt');
  const range = IDBKeyRange.bound([campaignId, 0], [campaignId, Number.MAX_SAFE_INTEGER]);

  const events: TimelineEvent[] = [];
  let cursor = await index.openCursor(range);

  while (cursor) {
    events.push(cursor.value);
    cursor = await cursor.continue();
  }

  return events;
}

export async function createTimelineEvent(data: NewTimelineEvent): Promise<TimelineEvent> {
  const db = await getDB();
  const now = Date.now();
  const event: TimelineEvent = {
    id: generateId(),
    ...data,
    createdAt: now,
  };
  await db.add('timelineEvents', event);
  return event;
}
