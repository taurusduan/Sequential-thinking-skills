import { access, mkdtemp, readFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { run } from '../cli/index.js';

const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

function captureStdout(): string {
  return stdoutSpy.mock.calls.map((call) => String(call[0])).join('');
}

describe('INT-S1 Guided Core', () => {
  afterEach(() => {
    stdoutSpy.mockClear();
    stderrSpy.mockClear();
  });

  it('runs a 5-step session through the CLI and verifies convergence plus persisted artifacts', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-int-s1-'));
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);

    try {
      await run(['start', '--name', 'INT S1 Session', '--goal', 'validate sprint one', '--mode', 'explore', '--totalSteps', '5']);
      const sessionPath = path.join('.anws', 'runtime', 'sequential-thinking', 'int-s1-session');

      for (let step = 1; step <= 5; step += 1) {
        stdoutSpy.mockClear();
        await run(['step', '--sessionPath', sessionPath, '--content', `step-${step}`]);
        const output = captureStdout();

        expect(output).toContain(`step: ${step}/5`);

        if (step === 4) {
          expect(output).toContain('shouldConverge: true');
          expect(output).toContain('mustConclude: false');
        }

        if (step === 5) {
          expect(output).toContain('mustConclude: true');
          expect(output).toContain('status: completed');
        }
      }

      const absoluteSessionPath = path.join(root, sessionPath);
      const savedSession = JSON.parse(await readFile(path.join(absoluteSessionPath, 'session.json'), 'utf8'));
      const savedSteps = await readdir(path.join(absoluteSessionPath, 'steps'));

      expect(savedSession.currentStep).toBe(5);
      expect(savedSession.status).toBe('completed');
      expect(savedSteps).toHaveLength(5);
      await access(path.join(absoluteSessionPath, 'final.md'));
    } finally {
      cwdSpy.mockRestore();
    }
  });
});
