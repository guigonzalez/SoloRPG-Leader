import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Campaign, Message, Recap, Entity, Fact, Roll, Character, Leader } from '../../types/models';

interface SoloRPGDB extends DBSchema {
  campaigns: { key: string; value: Campaign; indexes: { 'createdAt': number; 'updatedAt': number } };
  messages: { key: string; value: Message; indexes: { 'campaignId': string; 'campaignCreatedAt': [string, number] } };
  recaps: { key: string; value: Recap; indexes: { 'updatedAt': number } };
  entities: { key: string; value: Entity; indexes: { 'campaignId': string; 'campaignLastSeen': [string, number] } };
  facts: { key: string; value: Fact; indexes: { 'campaignId': string; 'subjectEntityId': string; 'sourceMessageId': string; 'campaignCreatedAt': [string, number] } };
  rolls: { key: string; value: Roll; indexes: { 'campaignId': string; 'campaignCreatedAt': [string, number] } };
  characters: { key: string; value: Character; indexes: { 'campaignId': string } };
  leaders: { key: string; value: Leader; indexes: { 'campaignId': string } };
}

const DB_NAME = import.meta.env.VITE_DB_NAME || 'solo-rpg-leader-db';
const DB_VERSION = 4;

let dbInstance: IDBPDatabase<SoloRPGDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<SoloRPGDB>> {
  if (dbInstance) return dbInstance;
  dbInstance = await openDB<SoloRPGDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const campaignStore = db.createObjectStore('campaigns', { keyPath: 'id' });
        campaignStore.createIndex('createdAt', 'createdAt');
        campaignStore.createIndex('updatedAt', 'updatedAt');
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('campaignId', 'campaignId');
        messageStore.createIndex('campaignCreatedAt', ['campaignId', 'createdAt']);
        const recapStore = db.createObjectStore('recaps', { keyPath: 'campaignId' });
        recapStore.createIndex('updatedAt', 'updatedAt');
        const entityStore = db.createObjectStore('entities', { keyPath: 'id' });
        entityStore.createIndex('campaignId', 'campaignId');
        entityStore.createIndex('campaignLastSeen', ['campaignId', 'lastSeenAt']);
        const factStore = db.createObjectStore('facts', { keyPath: 'id' });
        factStore.createIndex('campaignId', 'campaignId');
        factStore.createIndex('subjectEntityId', 'subjectEntityId');
        factStore.createIndex('sourceMessageId', 'sourceMessageId');
        factStore.createIndex('campaignCreatedAt', ['campaignId', 'createdAt']);
        const rollStore = db.createObjectStore('rolls', { keyPath: 'id' });
        rollStore.createIndex('campaignId', 'campaignId');
        rollStore.createIndex('campaignCreatedAt', ['campaignId', 'createdAt']);
      }
      if (oldVersion < 2) {
        const characterStore = db.createObjectStore('characters', { keyPath: 'id' });
        characterStore.createIndex('campaignId', 'campaignId');
      }
      if (oldVersion < 4) {
        const leaderStore = db.createObjectStore('leaders', { keyPath: 'id' });
        leaderStore.createIndex('campaignId', 'campaignId');
      }
    },
  });
  return dbInstance;
}

export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
