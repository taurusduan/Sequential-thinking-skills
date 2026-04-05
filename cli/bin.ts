#!/usr/bin/env node
import process from 'node:process';

import { runFromProcessArgv } from './index.js';

runFromProcessArgv(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
