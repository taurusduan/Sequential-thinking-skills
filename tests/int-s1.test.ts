import { access, mkdtemp, readFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { run } from '../cli/index.js';

const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

function captureStdout(): string {
  return stdoutSpy.mock.calls.map((call) => String(call[0])).join('');
}

function extractStoragePath(output: string): string {
  const match = /storagePath: (.+)/.exec(output);
  const storagePath = match?.[1];

  if (!storagePath) {
    throw new Error('storagePath was not found in CLI output');
  }

  return storagePath.trim();
}

function useRuntimeStateRoot(root: string): () => void {
  const originalLocalAppData = process.env.LOCALAPPDATA;
  const originalXdgStateHome = process.env.XDG_STATE_HOME;
  const originalHome = process.env.HOME;

  if (process.platform === 'win32') {
    process.env.LOCALAPPDATA = root;
  } else if (process.platform === 'darwin') {
    process.env.HOME = root;
  } else {
    process.env.XDG_STATE_HOME = root;
  }

  return () => {
    process.env.LOCALAPPDATA = originalLocalAppData;
    process.env.XDG_STATE_HOME = originalXdgStateHome;
    process.env.HOME = originalHome;
  };
}

describe('INT-S1 Guided Core', () => {
  afterEach(() => {
    stdoutSpy.mockClear();
    stderrSpy.mockClear();
  });

  it('runs a 5-step session through the CLI and verifies convergence plus persisted artifacts', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-int-s1-'));
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);
    const restoreRuntimeRoot = useRuntimeStateRoot(root);

    try {
      await run(['start', '--name', 'INT S1 Session', '--goal', 'validate sprint one', '--mode', 'explore', '--totalSteps', '5']);
      const sessionPath = extractStoragePath(captureStdout());

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

      const savedSession = JSON.parse(await readFile(path.join(sessionPath, 'session.json'), 'utf8'));
      const savedSteps = await readdir(path.join(sessionPath, 'steps'));

      expect(savedSession.currentStep).toBe(5);
      expect(savedSession.status).toBe('completed');
      expect(savedSteps).toHaveLength(5);
      await access(path.join(sessionPath, 'final.md'));
    } finally {
      restoreRuntimeRoot();
      cwdSpy.mockRestore();
    }
  });
});
