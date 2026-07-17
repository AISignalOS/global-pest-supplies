import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { config } from './config.js';

const queueFile = () => path.join(config.dataDir, 'review-queue.json');
const logFile = () => path.join(config.dataDir, 'change-log.jsonl');

export type QueueStatus = 'pending' | 'approved' | 'rejected' | 'imported' | 'rolled_back';
export interface QueueEntry {
  id: string;
  createdAt: string;
  status: QueueStatus;
  product: Record<string, unknown>;
  score: Record<string, unknown>;
  tags: Record<string, unknown>;
  source: string;
  notes?: string;
  shopifyProductId?: string;
}

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(config.dataDir, { recursive: true });
}

async function readQueue(): Promise<QueueEntry[]> {
  await ensureDataDir();
  try {
    return JSON.parse(await fs.readFile(queueFile(), 'utf8'));
  } catch {
    return [];
  }
}
async function writeQueue(entries: QueueEntry[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(queueFile(), JSON.stringify(entries, null, 2));
}
async function appendLog(entry: Record<string, unknown>): Promise<void> {
  await ensureDataDir();
  await fs.appendFile(logFile(), JSON.stringify({ timestamp: new Date().toISOString(), ...entry }) + '\n');
}

export async function stageForReview(
  product: Record<string, unknown>,
  score: Record<string, unknown>,
  tags: Record<string, unknown>,
  source: string,
): Promise<QueueEntry> {
  const entries = await readQueue();
  const entry: QueueEntry = { id: randomUUID(), createdAt: new Date().toISOString(), status: 'pending', product, score, tags, source };
  entries.push(entry);
  await writeQueue(entries);
  await appendLog({ action: 'stage', entryId: entry.id });
  return entry;
}

export async function listQueue(status?: QueueStatus): Promise<QueueEntry[]> {
  const entries = await readQueue();
  return status ? entries.filter((e) => e.status === status) : entries;
}

export async function getEntry(id: string): Promise<QueueEntry> {
  const entries = await readQueue();
  const entry = entries.find((e) => e.id === id);
  if (!entry) throw new Error(`Review queue entry not found: ${id}`);
  return entry;
}

async function updateEntry(id: string, patch: Partial<QueueEntry>): Promise<QueueEntry> {
  const entries = await readQueue();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error(`Review queue entry not found: ${id}`);
  const before = { ...entries[idx] };
  entries[idx] = { ...entries[idx], ...patch };
  await writeQueue(entries);
  await appendLog({ action: 'update', entryId: id, before, after: entries[idx] });
  return entries[idx];
}

export async function approveEntry(id: string, notes?: string): Promise<QueueEntry> {
  return updateEntry(id, { status: 'approved', notes });
}
export async function rejectEntry(id: string, notes?: string): Promise<QueueEntry> {
  return updateEntry(id, { status: 'rejected', notes });
}
export async function recordImport(id: string, shopifyProductId: string): Promise<QueueEntry> {
  return updateEntry(id, { status: 'imported', shopifyProductId });
}
export async function recordRollback(id: string): Promise<QueueEntry> {
  return updateEntry(id, { status: 'rolled_back' });
}
