import { z } from 'zod';

const resourceBase = {
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(100),
  description: z.string().max(255).optional(),
};

export const createResourceSchema = z.object({
  name: resourceBase.name,
  code: resourceBase.code,
  description: resourceBase.description,
});

export const updateResourceSchema = z.object({
  name: resourceBase.name.optional(),
  code: resourceBase.code.optional(),
  description: resourceBase.description,
}).partial();

export const resourceParamsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export type ResourceCreateInput = z.infer<typeof createResourceSchema>;
export type ResourceUpdateInput = z.infer<typeof updateResourceSchema>;
export type ResourceParams = z.infer<typeof resourceParamsSchema>;