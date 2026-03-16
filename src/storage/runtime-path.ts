import { access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const APP_DIRECTORY = 'sthink';
const SESSIONS_DIRECTORY = 'sessions';
const LEGACY_RUNTIME_SEGMENTS = ['.anws', 'runtime', 'sequential-thinking'];

function getWindowsStateBase(): string {
  return process.env.LOCALAPPDATA ?? path.join(os.homedir(), 'AppData', 'Local');
}

function getDarwinStateBase(): string {
  return path.join(os.homedir(), 'Library', 'Application Support');
}

function getLinuxStateBase(): string {
  return process.env.XDG_STATE_HOME ?? path.join(os.homedir(), '.local', 'state');
}

export function getUserStateRoot(): string {
  if (process.platform === 'win32') {
    return path.join(getWindowsStateBase(), APP_DIRECTORY);
  }

  if (process.platform === 'darwin') {
    return path.join(getDarwinStateBase(), APP_DIRECTORY);
  }

  return path.join(getLinuxStateBase(), APP_DIRECTORY);
}

export function getDefaultRuntimeRoot(): string {
  return path.join(getUserStateRoot(), SESSIONS_DIRECTORY);
}

function normalizeLegacyRelativePath(sessionPath: string): string {
  const normalized = path.normalize(sessionPath);
  const legacyPrefix = path.join(...LEGACY_RUNTIME_SEGMENTS) + path.sep;

  if (normalized === path.join(...LEGACY_RUNTIME_SEGMENTS)) {
    return '';
  }

  if (normalized.startsWith(legacyPrefix)) {
    return normalized.slice(legacyPrefix.length);
  }

  return normalized;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function resolveSessionPath(sessionPath: string, currentWorkingDirectory: string): Promise<string> {
  if (path.isAbsolute(sessionPath)) {
    return sessionPath;
  }

  const fromCurrentWorkingDirectory = path.resolve(currentWorkingDirectory, sessionPath);
  if (await pathExists(fromCurrentWorkingDirectory)) {
    return fromCurrentWorkingDirectory;
  }

  const normalizedRelativePath = normalizeLegacyRelativePath(sessionPath);
  return path.join(getDefaultRuntimeRoot(), normalizedRelativePath);
}
