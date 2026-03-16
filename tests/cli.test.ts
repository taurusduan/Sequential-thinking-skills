import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { run } from '../cli/index.js';

const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

function getStdout(): string {
  return stdoutSpy.mock.calls.map((call) => String(call[0])).join('');
}

describe('CLI run', () => {
  afterEach(() => {
    stdoutSpy.mockClear();
    stderrSpy.mockClear();
  });

  it('supports the start command', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-cli-start-'));
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);

    try {
      await run(['start', '--name', 'CLI Session', '--goal', 'wire runtime', '--mode', 'explore', '--totalSteps', '5']);
      const output = getStdout();
      expect(output).toContain('session: CLI Session');
      expect(output).toContain('nextPhaseHint:');
    } finally {
      cwdSpy.mockRestore();
    }
  });

  it('supports the step command', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-cli-step-'));
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);

    try {
      await run(['start', '--name', 'CLI Step Session', '--goal', 'advance one step', '--mode', 'audit', '--totalSteps', '5']);
      stdoutSpy.mockClear();

      const sessionPath = path.join('.anws', 'runtime', 'sequential-thinking', 'cli-step-session');
      await run(['step', '--sessionPath', sessionPath, '--content', '先确认被审视对象。']);

      const output = getStdout();
      expect(output).toContain('step: 1/5');
      expect(output).toContain('status: active');
    } finally {
      cwdSpy.mockRestore();
    }
  });
});
