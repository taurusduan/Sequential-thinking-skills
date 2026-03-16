import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SessionStateSchema, StepRecordSchema } from '../protocol/schema.js';
import type { SessionState, StepRecord } from '../types/session.js';
import { normalizeSessionName, resolveCollisionName } from './path-utils.js';

const RUNTIME_ROOT = ['.anws', 'runtime', 'sequential-thinking'];

async function ensureRuntimeRoot(projectRoot: string): Promise<string> {
  const runtimeRoot = path.join(projectRoot, ...RUNTIME_ROOT);
  await mkdir(runtimeRoot, { recursive: true });
  return runtimeRoot;
}

export async function createSessionDirectory(projectRoot: string, sessionName: string): Promise<string> {
  const runtimeRoot = await ensureRuntimeRoot(projectRoot);
  const entries = await readdir(runtimeRoot, { withFileTypes: true });
  const existingNames = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const baseName = normalizeSessionName(sessionName);
  const resolvedName = resolveCollisionName(baseName, existingNames);
  const sessionDir = path.join(runtimeRoot, resolvedName);

  await mkdir(path.join(sessionDir, 'steps'), { recursive: true });
  return sessionDir;
}

export async function writeSessionState(session: SessionState): Promise<void> {
  const parsed = SessionStateSchema.parse(session);
  await writeFile(path.join(parsed.storagePath, 'session.json'), `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
}

export async function writeStepRecord(storagePath: string, step: StepRecord): Promise<void> {
  const parsed = StepRecordSchema.parse(step);
  const fileName = `${String(parsed.stepNumber).padStart(2, '0')}.json`;
  await writeFile(path.join(storagePath, 'steps', fileName), `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
}
