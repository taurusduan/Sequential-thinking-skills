import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { FinalSessionSummary } from '../runtime/finalize-session.js';

export function renderFinalMarkdown(summary: FinalSessionSummary): string {
  return [
    `# Final Summary - ${summary.name}`,
    '',
    `- goal: ${summary.goal}`,
    `- mode: ${summary.mode}`,
    `- totalSteps: ${summary.totalSteps}`,
    `- completedSteps: ${summary.completedSteps}`,
    '',
    '## Final Conclusion',
    '',
    summary.finalStepContent,
    ''
  ].join('\n');
}

export async function writeFinalMarkdown(storagePath: string, summary: FinalSessionSummary): Promise<void> {
  const content = renderFinalMarkdown(summary);
  await writeFile(path.join(storagePath, 'final.md'), content, 'utf8');
}
