import { access, mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { run } from '../cli/index.js';

const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

function getStdout(): string {
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

describe('replay CLI', () => {
  afterEach(() => {
    stdoutSpy.mockClear();
    stderrSpy.mockClear();
  });

  it('creates replay.md and exports replay output to the current directory', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-replay-cli-'));
    const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(root);
    const restoreRuntimeRoot = useRuntimeStateRoot(root);

    try {
      await run(['start', '--name', 'Replay CLI Session', '--goal', 'finish replay flow', '--mode', 'explore', '--totalSteps', '5']);
      const sessionPath = extractStoragePath(getStdout());
      stdoutSpy.mockClear();

      for (let step = 1; step <= 5; step += 1) {
        await run(['step', '--sessionPath', sessionPath, '--content', `step-${step}`]);
      }

      stdoutSpy.mockClear();
      await run(['replay', '--sessionPath', sessionPath]);
      const output = getStdout();

      expect(output).toContain('replay:');
      expect(output).toContain('exported:');

      await access(path.join(sessionPath, 'replay.md'));
      await access(path.join(root, 'replay-cli-session-replay.md'));
    } finally {
      restoreRuntimeRoot();
      cwdSpy.mockRestore();
    }
  });
});
