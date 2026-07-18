import { describe, it, expect, beforeAll } from 'vitest';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';

beforeAll(() => {
  process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), 'gps-mcp-'));
});

describe('reviewQueue', () => {
  it('stages, approves, and lists entries', async () => {
    const queue = await import('../src/reviewQueue.js');
    const entry = await queue.stageForReview({ title: 'Test Product' }, { estMarginPct: 0.3 }, { pestTypes: ['ants'] }, 'manual-test');
    expect(entry.status).toBe('pending');

    await queue.approveEntry(entry.id, 'looks good');
    const approved = await queue.listQueue('approved');
    expect(approved.map((e) => e.id)).toContain(entry.id);
  });

  it('throws for an unknown entry id', async () => {
    const queue = await import('../src/reviewQueue.js');
    await expect(queue.getEntry('does-not-exist')).rejects.toThrow();
  });
});
