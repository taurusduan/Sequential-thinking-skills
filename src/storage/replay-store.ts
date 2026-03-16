import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SessionStateSchema } from '../protocol/schema.js';
import { renderReplayMarkdown } from '../replay/replay-template.js';
import type { SessionState } from '../types/session.js';
import { normalizeSessionName, resolveCollisionName } from './path-utils.js';

export async function loadCompletedSession(storagePath: string): Promise<SessionState> {
  const raw = await readFile(path.join(storagePath, 'session.json'), 'utf8');
  const session = SessionStateSchema.parse(JSON.parse(raw));

  if (session.status !== 'completed') {
    throw new Error('Replay requires a completed session');
  }

  return session;
}

export async function writeReplayMarkdown(storagePath: string, session: SessionState): Promise<string> {
  const content = renderReplayMarkdown(session);
  const target = path.join(storagePath, 'replay.md');
  await writeFile(target, content, 'utf8');
  return target;
}

export async function exportReplayToDirectory(session: SessionState, targetDirectory: string): Promise<string> {
  const entries = await readdir(targetDirectory, { withFileTypes: true });
  const existingNames = entries.filter((entry) => entry.isFile()).map((entry) => entry.name.replace(/\.md$/i, ''));
  const baseName = `${normalizeSessionName(session.name)}-replay`;
  const resolvedName = resolveCollisionName(baseName, existingNames);
  const target = path.join(targetDirectory, `${resolvedName}.md`);

  await writeFile(target, renderReplayMarkdown(session), 'utf8');
  return target;
}
