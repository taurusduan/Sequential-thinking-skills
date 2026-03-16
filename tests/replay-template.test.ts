import { describe, expect, it } from 'vitest';

import { renderReplayMarkdown } from '../src/replay/replay-template.js';
import type { SessionState } from '../src/types/session.js';

const session: SessionState = {
  name: 'Replay Session',
  goal: 'review completed run',
  mode: 'explore',
  totalSteps: 5,
  currentStep: 5,
  shouldConverge: true,
  status: 'completed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  storagePath: '.anws/runtime/sequential-thinking/replay-session',
  steps: [
    {
      stepNumber: 1,
      content: 'step one',
      mode: 'explore',
      phaseHint: 'hint one',
      shouldConverge: false,
      mustConclude: false,
      savedAt: new Date().toISOString()
    },
    {
      stepNumber: 5,
      content: 'final answer',
      mode: 'explore',
      phaseHint: 'hint final',
      shouldConverge: true,
      mustConclude: true,
      savedAt: new Date().toISOString()
    }
  ]
};

describe('renderReplayMarkdown', () => {
  it('renders session metadata, steps, and final conclusion', () => {
    const content = renderReplayMarkdown(session);

    expect(content).toContain('# Replay - Replay Session');
    expect(content).toContain('## Steps');
    expect(content).toContain('### Step 1');
    expect(content).toContain('## Final Conclusion');
    expect(content).toContain('final answer');
  });
});
