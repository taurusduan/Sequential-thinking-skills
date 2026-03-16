import type { SessionState } from '../types/session.js';

export function renderReplayMarkdown(session: SessionState): string {
  const lines: string[] = [
    `# Replay - ${session.name}`,
    '',
    `- goal: ${session.goal}`,
    `- mode: ${session.mode}`,
    `- totalSteps: ${session.totalSteps}`,
    `- currentStep: ${session.currentStep}`,
    `- status: ${session.status}`,
    '',
    '## Steps',
    ''
  ];

  for (const step of session.steps) {
    lines.push(`### Step ${step.stepNumber}`);
    lines.push('');
    lines.push(`- phaseHint: ${step.phaseHint}`);
    lines.push(`- shouldConverge: ${String(step.shouldConverge)}`);
    lines.push(`- mustConclude: ${String(step.mustConclude)}`);
    lines.push('');
    lines.push(step.content);
    lines.push('');
  }

  const finalStep = session.steps.at(-1);

  if (finalStep) {
    lines.push('## Final Conclusion');
    lines.push('');
    lines.push(finalStep.content);
    lines.push('');
  }

  return lines.join('\n');
}
