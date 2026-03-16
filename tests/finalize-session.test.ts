import { describe, expect, it } from 'vitest';

import { finalizeSession } from '../src/runtime/finalize-session.js';
import type { SessionState } from '../src/types/session.js';

function createSession(overrides: Partial<SessionState> = {}): SessionState {
  return {
    name: 'Final Session',
    goal: 'summarize result',
    mode: 'explore',
    totalSteps: 5,
    currentStep: 5,
    shouldConverge: true,
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    storagePath: '.anws/runtime/sequential-thinking/final-session',
    steps: [
      {
        stepNumber: 1,
        content: 'first',
        mode: 'explore',
        phaseHint: 'hint',
        shouldConverge: false,
        mustConclude: false,
        savedAt: new Date().toISOString()
      },
      {
        stepNumber: 5,
        content: 'final conclusion',
        mode: 'explore',
        phaseHint: 'final hint',
        shouldConverge: true,
        mustConclude: true,
        savedAt: new Date().toISOString()
      }
    ],
    ...overrides
  };
}

describe('finalizeSession', () => {
  it('returns a final summary when session reaches the final step', () => {
    const summary = finalizeSession(createSession());
    expect(summary.completedSteps).toBe(2);
    expect(summary.finalStepContent).toBe('final conclusion');
  });

  it('rejects unfinished sessions', () => {
    expect(() => finalizeSession(createSession({ currentStep: 4, status: 'active' }))).toThrow();
  });
});
