import { describe, expect, it } from 'vitest';

import { getStepPolicy } from '../src/protocol/mode-policy.js';

describe('getStepPolicy', () => {
  it('starts convergence at step 4 for 5-step sessions', () => {
    const step3 = getStepPolicy('explore', 3, 5);
    const step4 = getStepPolicy('explore', 4, 5);
    const step5 = getStepPolicy('explore', 5, 5);

    expect(step3.shouldConverge).toBe(false);
    expect(step4.shouldConverge).toBe(true);
    expect(step4.mustConclude).toBe(false);
    expect(step5.mustConclude).toBe(true);
  });

  it('starts convergence at step 6 for 8-step sessions', () => {
    const step5 = getStepPolicy('branch', 5, 8);
    const step6 = getStepPolicy('branch', 6, 8);
    const step8 = getStepPolicy('branch', 8, 8);

    expect(step5.shouldConverge).toBe(false);
    expect(step6.shouldConverge).toBe(true);
    expect(step8.mustConclude).toBe(true);
  });

  it('returns audit-specific guidance', () => {
    const policy = getStepPolicy('audit', 2, 5);
    expect(policy.phaseHint).toContain('被审视对象');
    expect(policy.shouldConverge).toBe(false);
  });

  it('throws on invalid step number', () => {
    expect(() => getStepPolicy('explore', 0, 5)).toThrow();
  });
});
