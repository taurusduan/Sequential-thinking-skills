import path from 'node:path';
import process from 'node:process';

import { parseArgs } from '../src/cli/args.js';
import { formatStartOutput, formatStepOutput } from '../src/cli/format-output.js';
import { advanceStep } from '../src/runtime/advance-step.js';
import { startSession } from '../src/runtime/start-session.js';
import { readSessionState } from '../src/storage/read-session.js';
import { exportReplayToDirectory, loadCompletedSession, writeReplayMarkdown } from '../src/storage/replay-store.js';
import { resolveSessionPath } from '../src/storage/runtime-path.js';

export async function run(argv: string[] = process.argv.slice(2)): Promise<void> {
  const parsed = parseArgs(argv);
  const currentWorkingDirectory = process.cwd();

  if (parsed.command === 'start') {
    const name = parsed.options.name;
    const goal = parsed.options.goal;
    const mode = parsed.options.mode;
    const totalSteps = parsed.options.totalSteps;

    if (!name || !goal || !mode || !totalSteps) {
      throw new Error('start requires --name --goal --mode --totalSteps');
    }

    const result = await startSession({
      name,
      goal,
      mode: mode as 'explore' | 'branch' | 'audit',
      totalSteps: Number(totalSteps) as 5 | 8
    });

    process.stdout.write(`${formatStartOutput(result.session, result.nextStepPolicy)}\n`);
    return;
  }

  if (parsed.command === 'step') {
    const sessionPath = parsed.options.sessionPath;
    const content = parsed.options.content;

    if (!sessionPath) {
      throw new Error('step requires --sessionPath');
    }

    if (!content) {
      throw new Error('step requires --content');
    }

    const resolvedSessionPath = await resolveSessionPath(sessionPath, currentWorkingDirectory);
    const session = await readSessionState(resolvedSessionPath);
    const result = await advanceStep(session, {
      content
    });

    process.stdout.write(`${formatStepOutput(result.session, result.step)}\n`);
    return;
  }

  if (parsed.command === 'replay') {
    const sessionPath = parsed.options.sessionPath;
    const exportDir = parsed.options.exportDir ? path.resolve(currentWorkingDirectory, parsed.options.exportDir) : currentWorkingDirectory;

    if (!sessionPath) {
      throw new Error('replay requires --sessionPath');
    }

    const absoluteSessionPath = await resolveSessionPath(sessionPath, currentWorkingDirectory);
    const session = await loadCompletedSession(absoluteSessionPath);
    const replayPath = await writeReplayMarkdown(absoluteSessionPath, session);
    const exportedPath = await exportReplayToDirectory(session, exportDir);

    process.stdout.write(`replay: ${replayPath}\nexported: ${exportedPath}\n`);
    return;
  }

  throw new Error(`Unsupported command: ${parsed.command || '<empty>'}`);
}

const entryFile = process.argv[1];

if (entryFile && path.resolve(entryFile) === path.resolve(new URL(import.meta.url).pathname)) {
  run().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
