import { z } from 'zod';

export const createPermissionRoleSchema = z.object({
  role_id: z.number().int().positive(),
  resource_action_id: z.number().int().positive(),
});

export const permissionRoleParamsSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});

// For bulk assignment: assign multiple resource_action_ids to a role
export const assignPermissionsToRoleSchema = z.object({
  role_id: z.number().int().positive(),
  resource_action_ids: z.array(z.number().int().positive()),
});

export const updatePermissionRoleSchema = z.object({
  role_id: z.number().int().positive().optional(),
  resource_action_id: z.number().int().positive().optional(),
}).partial();

export type PermissionRoleCreateInput = z.infer<typeof createPermissionRoleSchema>;
export type PermissionRoleParams = z.infer<typeof permissionRoleParamsSchema>;
export type AssignPermissionsToRoleInput = z.infer<typeof assignPermissionsToRoleSchema>;