import { z } from 'zod';

// Junction table – only foreign keys
export const createUserRoleSchema = z.object({
  user_id: z.number().int().positive(),
  role_id: z.number().int().positive(),
});

// For updates, we usually don't allow changing both keys; if needed, we use delete + create.
// So we only provide a schema for creation and for params.
export const userRoleParamsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

// For bulk assignment, we might accept an array of role IDs
export const assignRolesToUserSchema = z.object({
  user_id: z.number().int().positive(),
  role_ids: z.array(z.number().int().positive()),
});

export type UserRoleCreateInput = z.infer<typeof createUserRoleSchema>;
export type UserRoleParams = z.infer<typeof userRoleParamsSchema>;
export type AssignRolesToUserInput = z.infer<typeof assignRolesToUserSchema>;