import { describe, expect, it } from 'vitest';

import { SessionStateSchema, StartInputSchema, StepInputSchema } from '../src/protocol/schema.js';

describe('StartInputSchema', () => {
  it('accepts the minimal valid start input', () => {
    const parsed = StartInputSchema.parse({
      name: 'session-a',
      goal: 'clarify protocol direction',
      mode: 'explore',
      totalSteps: 5
    });

    expect(parsed.mode).toBe('explore');
    expect(parsed.totalSteps).toBe(5);
  });

  it('rejects invalid mode', () => {
    const result = StartInputSchema.safeParse({
      name: 'session-a',
      goal: 'clarify protocol direction',
      mode: 'unknown',
      totalSteps: 5
    });

    expect(result.success).toBe(false);
  });
});

describe('StepInputSchema', () => {
  it('rejects empty content', () => {
    const result = StepInputSchema.safeParse({ content: '   ' });
    expect(result.success).toBe(false);
  });
});

describe('SessionStateSchema', () => {
  it('accepts a valid session state shape', () => {
    const now = new Date().toISOString();
    const result = SessionStateSchema.safeParse({
      name: 'session-a',
      goal: 'clarify protocol direction',
      mode: 'audit',
      totalSteps: 8,
      currentStep: 0,
      shouldConverge: false,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      storagePath: '.anws/runtime/sequential-thinking/session-a',
      steps: []
    });

    expect(result.success).toBe(true);
  });
});
