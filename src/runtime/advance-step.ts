import { StepInputSchema } from '../protocol/schema.js';
import { getStepPolicy } from '../protocol/mode-policy.js';
import { writeFinalMarkdown } from '../storage/final-output.js';
import { writeSessionState, writeStepRecord } from '../storage/session-store.js';
import { finalizeSession } from './finalize-session.js';
import type { SessionState, StepInput, StepRecord } from '../types/session.js';

export interface AdvanceStepResult {
  session: SessionState;
  step: StepRecord;
}

export async function advanceStep(session: SessionState, input: StepInput): Promise<AdvanceStepResult> {
  if (session.status === 'completed') {
    throw new Error('Session is already completed');
  }

  const parsed = StepInputSchema.parse(input);
  const stepNumber = session.currentStep + 1;
  const policy = getStepPolicy(session.mode, stepNumber, session.totalSteps);
  const savedAt = new Date().toISOString();

  const step: StepRecord = {
    stepNumber,
    content: parsed.content,
    mode: session.mode,
    phaseHint: policy.phaseHint,
    shouldConverge: policy.shouldConverge,
    mustConclude: policy.mustConclude,
    savedAt
  };

  const nextSession: SessionState = {
    ...session,
    currentStep: stepNumber,
    shouldConverge: policy.shouldConverge,
    status: policy.mustConclude ? 'completed' : 'active',
    updatedAt: savedAt,
    steps: [...session.steps, step]
  };

  await writeStepRecord(nextSession.storagePath, step);
  await writeSessionState(nextSession);

  if (nextSession.status === 'completed') {
    const summary = finalizeSession(nextSession);
    await writeFinalMarkdown(nextSession.storagePath, summary);
  }

  return {
    session: nextSession,
    step
  };
}
