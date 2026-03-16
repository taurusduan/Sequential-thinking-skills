import { access, mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { run } from '../cli/index.js';

const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

function getStdout(): string {
  return stdoutSpy.mock.calls.map((call) => String(call[0])).join('');
}

describe('replay CLI', () => {
  afterEach(() => {
    stdoutSpy.mockClear();
    stderrSpy.mockClear();
  });

  it('creates replay.md and exports replay output to the current directory', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-replay-cli-'));
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);

    try {
      await run(['start', '--name', 'Replay CLI Session', '--goal', 'finish replay flow', '--mode', 'explore', '--totalSteps', '5']);
      const sessionPath = path.join('.anws', 'runtime', 'sequential-thinking', 'replay-cli-session');

      for (let step = 1; step <= 5; step += 1) {
        await run(['step', '--sessionPath', sessionPath, '--content', `step-${step}`]);
      }

      stdoutSpy.mockClear();
      await run(['replay', '--sessionPath', sessionPath]);
      const output = getStdout();

      expect(output).toContain('replay:');
      expect(output).toContain('exported:');

      await access(path.join(root, sessionPath, 'replay.md'));
      await access(path.join(root, 'replay-cli-session-replay.md'));
    } finally {
      cwdSpy.mockRestore();
    }
  });
});
