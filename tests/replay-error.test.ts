import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { loadCompletedSession } from '../src/storage/replay-store.js';
import type { SessionState } from '../src/types/session.js';

function createSession(storagePath: string, status: SessionState['status']): SessionState {
  return {
    name: 'Replay Error Session',
    goal: 'exercise replay errors',
    mode: 'audit',
    totalSteps: 5,
    currentStep: status === 'completed' ? 5 : 3,
    shouldConverge: status === 'completed',
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    storagePath,
    steps: []
  };
}

describe('replay error paths', () => {
  it('rejects unfinished sessions', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-replay-error-'));
    const sessionPath = path.join(root, 'session');
    await mkdir(sessionPath, { recursive: true });
    await writeFile(path.join(sessionPath, 'session.json'), JSON.stringify(createSession(sessionPath, 'active'), null, 2), 'utf8');

    await expect(loadCompletedSession(sessionPath)).rejects.toThrow('Replay requires a completed session');
  });

  it('surfaces missing session.json errors', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-replay-missing-'));
    const sessionPath = path.join(root, 'session');
    await mkdir(sessionPath, { recursive: true });

    await expect(loadCompletedSession(sessionPath)).rejects.toThrow();
  });
});
