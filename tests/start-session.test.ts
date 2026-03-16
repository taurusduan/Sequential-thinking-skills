import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { startSession } from '../src/runtime/start-session.js';

describe('startSession', () => {
  it('creates the initial session state and storage directory', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-start-'));
    const result = await startSession(
      {
        name: 'Protocol Review',
        goal: 'clarify runtime protocol',
        mode: 'explore',
        totalSteps: 5
      },
      root
    );

    expect(result.session.currentStep).toBe(0);
    expect(result.session.status).toBe('active');
    expect(result.nextStepPolicy.phaseHint).toContain('澄清问题');

    const saved = JSON.parse(await readFile(path.join(result.session.storagePath, 'session.json'), 'utf8'));
    expect(saved.name).toBe('Protocol Review');
    expect(saved.steps).toEqual([]);
  });
});
