import { z } from 'zod';

const roleBase = {
  name: z.string().min(1, 'Name is required').max(255),
  code: z.string().min(1, 'Code is required').max(100),
  description: z.string().max(255).optional(),
};

export const createRoleSchema = z.object({
  name: roleBase.name,
  code: roleBase.code,
  description: roleBase.description,
});

export const updateRoleSchema = z.object({
  name: roleBase.name.optional(),
  code: roleBase.code.optional(),
  description: roleBase.description,
}).partial();

export const roleParamsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

export type RoleCreateInput = z.infer<typeof createRoleSchema>;
export type RoleUpdateInput = z.infer<typeof updateRoleSchema>;
export type RoleParams = z.infer<typeof roleParamsSchema>;