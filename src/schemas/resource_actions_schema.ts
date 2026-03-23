import { z } from 'zod';

export const createResourceActionSchema = z.object({
  resource_id: z.number().int().positive(),
  action_id: z.number().int().positive(),
});

export const resourceActionParamsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

// For bulk creation
export const bulkCreateResourceActionsSchema = z.object({
  resource_id: z.number().int().positive(),
  action_ids: z.array(z.number().int().positive()),
});

export type ResourceActionCreateInput = z.infer<typeof createResourceActionSchema>;
export type ResourceActionParams = z.infer<typeof resourceActionParamsSchema>;
export type BulkCreateResourceActionsInput = z.infer<typeof bulkCreateResourceActionsSchema>;