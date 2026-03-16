import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { renderFinalMarkdown, writeFinalMarkdown } from '../src/storage/final-output.js';

describe('final output', () => {
  it('renders summary markdown', () => {
    const rendered = renderFinalMarkdown({
      name: 'Summary Session',
      goal: 'produce summary',
      mode: 'audit',
      totalSteps: 5,
      completedSteps: 5,
      finalStepContent: 'audit conclusion'
    });

    expect(rendered).toContain('# Final Summary - Summary Session');
    expect(rendered).toContain('audit conclusion');
  });

  it('writes final.md to disk', async () => {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'st-final-md-'));

    await writeFinalMarkdown(dir, {
      name: 'Summary Session',
      goal: 'produce summary',
      mode: 'branch',
      totalSteps: 8,
      completedSteps: 8,
      finalStepContent: 'chosen path'
    });

    const saved = await readFile(path.join(dir, 'final.md'), 'utf8');
    expect(saved).toContain('chosen path');
  });
});
