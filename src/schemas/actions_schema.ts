import { z } from 'zod';

const actionBase = {
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(100),
  description: z.string().max(255).optional(),
};

export const createActionSchema = z.object({
  name: actionBase.name,
  code: actionBase.code,
  description: actionBase.description,
});

export const updateActionSchema = z.object({
  name: actionBase.name.optional(),
  code: actionBase.code.optional(),
  description: actionBase.description,
}).partial();

export const actionParamsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export type ActionCreateInput = z.infer<typeof createActionSchema>;
export type ActionUpdateInput = z.infer<typeof updateActionSchema>;
export type ActionParams = z.infer<typeof actionParamsSchema>;