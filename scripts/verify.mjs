import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const smokeRoot = await mkdtemp(path.join(os.tmpdir(), 'st-verify-'));
const entryPath = path.join(projectRoot, 'dist', 'cli', 'index.js');
const entryUrl = pathToFileURL(entryPath);
const originalCwd = process.cwd();

try {
  process.chdir(smokeRoot);
  const module = await import(entryUrl.href);
  await module.run([
    'start',
    '--name',
    'verify-session',
    '--goal',
    'verify dist cli',
    '--mode',
    'explore',
    '--totalSteps',
    '5'
  ]);
} finally {
  process.chdir(originalCwd);
}
