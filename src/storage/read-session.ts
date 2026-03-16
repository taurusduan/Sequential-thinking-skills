import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { SessionStateSchema } from '../protocol/schema.js';
import type { SessionState } from '../types/session.js';

export async function readSessionState(storagePath: string): Promise<SessionState> {
  const raw = await readFile(path.join(storagePath, 'session.json'), 'utf8');
  return SessionStateSchema.parse(JSON.parse(raw));
}
