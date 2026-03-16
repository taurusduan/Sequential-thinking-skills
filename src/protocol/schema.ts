import { z } from 'zod';

import { SESSION_MODES, TOTAL_STEPS_OPTIONS } from '../types/session.js';

export const SessionModeSchema = z.enum(SESSION_MODES);
export const TotalStepsSchema = z.union([z.literal(TOTAL_STEPS_OPTIONS[0]), z.literal(TOTAL_STEPS_OPTIONS[1])]);
export const SessionStatusSchema = z.enum(['active', 'completed']);

export const StartInputSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  goal: z.string().trim().min(1, 'goal is required'),
  mode: SessionModeSchema,
  totalSteps: TotalStepsSchema
});

export const StepInputSchema = z.object({
  content: z.string().trim().min(1, 'content is required')
});

export const StepPolicySchema = z.object({
  phaseHint: z.string().min(1),
  shouldConverge: z.boolean(),
  mustConclude: z.boolean()
});

export const StepRecordSchema = z.object({
  stepNumber: z.number().int().positive(),
  content: z.string().min(1),
  mode: SessionModeSchema,
  phaseHint: z.string().min(1),
  shouldConverge: z.boolean(),
  mustConclude: z.boolean(),
  savedAt: z.string().datetime()
});

export const SessionStateSchema = z.object({
  name: z.string().min(1),
  goal: z.string().min(1),
  mode: SessionModeSchema,
  totalSteps: TotalStepsSchema,
  currentStep: z.number().int().min(0),
  shouldConverge: z.boolean(),
  status: SessionStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  storagePath: z.string().min(1),
  steps: z.array(StepRecordSchema)
});

export type StartInputSchemaType = z.infer<typeof StartInputSchema>;
export type StepInputSchemaType = z.infer<typeof StepInputSchema>;
export type StepPolicySchemaType = z.infer<typeof StepPolicySchema>;
export type StepRecordSchemaType = z.infer<typeof StepRecordSchema>;
export type SessionStateSchemaType = z.infer<typeof SessionStateSchema>;
