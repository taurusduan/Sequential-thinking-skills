import { access, mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { exportReplayToDirectory, loadCompletedSession, writeReplayMarkdown } from '../src/storage/replay-store.js';
import type { SessionState } from '../src/types/session.js';

function createCompletedSession(storagePath: string): SessionState {
  return {
    name: 'Replay Session',
    goal: 'review completed run',
    mode: 'branch',
    totalSteps: 5,
    currentStep: 5,
    shouldConverge: true,
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    storagePath,
    steps: [
      {
        stepNumber: 1,
        content: 'step one',
        mode: 'branch',
        phaseHint: 'hint one',
        shouldConverge: false,
        mustConclude: false,
        savedAt: new Date().toISOString()
      },
      {
        stepNumber: 5,
        content: 'final answer',
        mode: 'branch',
        phaseHint: 'hint final',
        shouldConverge: true,
        mustConclude: true,
        savedAt: new Date().toISOString()
      }
    ]
  };
}

describe('replay-store', () => {
  it('loads only completed sessions', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-replay-load-'));
    const sessionPath = path.join(root, 'session');
    await mkdir(sessionPath, { recursive: true });

    const completed = createCompletedSession(sessionPath);
    await writeFile(path.join(sessionPath, 'session.json'), JSON.stringify(completed, null, 2), 'utf8');

    const loaded = await loadCompletedSession(sessionPath);
    expect(loaded.status).toBe('completed');
  });

  it('writes replay.md and exports replay markdown to another directory', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-replay-write-'));
    const sessionPath = path.join(root, 'session');
    const exportPath = path.join(root, 'export');
    await mkdir(sessionPath, { recursive: true });
    await mkdir(exportPath, { recursive: true });

    const completed = createCompletedSession(sessionPath);
    const replayFile = await writeReplayMarkdown(sessionPath, completed);
    const exportedFile = await exportReplayToDirectory(completed, exportPath);

    await access(replayFile);
    await access(exportedFile);
    expect(path.basename(exportedFile)).toContain('replay-session-replay');
  });
});
