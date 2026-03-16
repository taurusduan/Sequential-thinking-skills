import { mkdtemp } from 'node:fs/promises';
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

describe('CLI run', () => {
  afterEach(() => {
    stdoutSpy.mockClear();
    stderrSpy.mockClear();
  });

  it('supports the start command', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-cli-start-'));
    const restoreRuntimeRoot = useRuntimeStateRoot(root);

    try {
      await run(['start', '--name', 'CLI Session', '--goal', 'wire runtime', '--mode', 'explore', '--totalSteps', '5']);
      const output = getStdout();
      expect(output).toContain('session: CLI Session');
      expect(output).toContain('nextPhaseHint:');
      expect(extractStoragePath(output)).toContain(path.join('sthink', 'sessions'));
    } finally {
      restoreRuntimeRoot();
    }
  });

  it('supports the step command with legacy relative session paths', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'st-cli-step-'));
    const restoreRuntimeRoot = useRuntimeStateRoot(root);

    try {
      await run(['start', '--name', 'CLI Step Session', '--goal', 'advance one step', '--mode', 'audit', '--totalSteps', '5']);
      const sessionPath = extractStoragePath(getStdout());
      stdoutSpy.mockClear();

      const legacyRelativePath = path.join('.anws', 'runtime', 'sequential-thinking', path.basename(sessionPath));
      await run(['step', '--sessionPath', legacyRelativePath, '--content', '先确认被审视对象。']);

      const output = getStdout();
      expect(output).toContain('step: 1/5');
      expect(output).toContain('status: active');
    } finally {
      restoreRuntimeRoot();
    }
  });
});
