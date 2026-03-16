import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { advanceStep } from '../src/runtime/advance-step.js';
import { startSession } from '../src/runtime/start-session.js';

describe('advanceStep', () => {
  it('persists a step and updates the session state', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-step-'));
    const started = await startSession(
      {
        name: 'Audit Session',
        goal: 'inspect assumptions',
        mode: 'audit',
        totalSteps: 5
      },
      root
    );

    const advanced = await advanceStep(started.session, {
      content: '先确认被审视对象和证据来源。'
    });

    expect(advanced.session.currentStep).toBe(1);
    expect(advanced.session.steps).toHaveLength(1);
    expect(advanced.step.phaseHint).toContain('被审视对象');

    const savedStep = JSON.parse(
      await readFile(path.join(advanced.session.storagePath, 'steps', '01.json'), 'utf8')
    );
    expect(savedStep.content).toBe('先确认被审视对象和证据来源。');

    const savedSession = JSON.parse(await readFile(path.join(advanced.session.storagePath, 'session.json'), 'utf8'));
    expect(savedSession.currentStep).toBe(1);
    expect(savedSession.steps).toHaveLength(1);
  });

  it('marks the session completed on the final step', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-final-'));
    const started = await startSession(
      {
        name: 'Branch Session',
        goal: 'compare two approaches',
        mode: 'branch',
        totalSteps: 5
      },
      root
    );

    let session = started.session;
    for (let index = 0; index < 5; index += 1) {
      const result = await advanceStep(session, {
        content: `step-${index + 1}`
      });
      session = result.session;
    }

    expect(session.status).toBe('completed');
    expect(session.currentStep).toBe(5);
    expect(session.steps[4]?.mustConclude).toBe(true);
  });
});
