import Role from '../models/roles_model';
import { RoleCreateInput, RoleUpdateInput } from '../schemas/roles_schema';
import {
  getPermissionsByRole,
  assignPermissionsToRole,
} from './permission_roles_crud';
import User from '../models/users_model';

// Create a new role.
export async function createRole(data: RoleCreateInput) {
  return await Role.create(data as any);
}

// Retrieve a role by primary key.
export async function getRoleById(id: number, includePermissions: boolean = true) {
  const role = await Role.findByPk(id);
  if (!role) return null;
  if (includePermissions) {
    // Use a separate method to get permissions; we can attach them manually
    const permissions = await getPermissionsByRole(id);
    (role as any).permissions = permissions; // or return a custom object
  }
  return role;
}

// Retrieve a role by its unique code.
export async function getRoleByCode(code: string) {
  return await Role.findOne({ where: { code } });
}

// Get paginated list of roles.
export async function getRoles(
  where: any = {},
  limit: number = 10,
  offset: number = 0
) {
  return await Role.findAndCountAll({ where, limit, offset });
}

// Update an existing role.
export async function updateRole(id: number, data: RoleUpdateInput) {
  const role = await Role.findByPk(id);
  if (!role) throw new Error('Role not found');
  await role.update(data);
  return role;
}

// Delete a role (hard delete).
export async function deleteRole(id: number) {
  return await Role.destroy({ where: { id } });
}

// Get all permissions (resource_action IDs) assigned to a role.
export async function getRolePermissions(roleId: number) {
  return await getPermissionsByRole(roleId);
}

// Assign one or more permissions to a role.
export async function assignPermissionsToRoles(roleId: number, resourceActionIds: number[]) {
  return await assignPermissionsToRole(roleId, resourceActionIds);
}

// Remove a specific permission from a role.
export async function removePermissionFromRole(roleId: number, resourceActionId: number) {
  // Need to locate the specific permission_role record
  const PermissionRole = (await import('../models/permission_roles_model')).default;
  return await PermissionRole.destroy({
    where: { role_id: roleId, resource_action_id: resourceActionId }
  });
}

// Get all users that have a given role.
export async function getUsersByRole(
  roleId: number,
  limit: number = 10,
  offset: number = 0
) {
  const users = await User.findAndCountAll({
    include: [
      {
        model: Role,
        where: { id: roleId },
        through: { attributes: [] },
        required: true,
      },
    ],
    limit,
    offset,
  });
  return users;
}

// Export types for service layer
export type RoleCrud = {
  createRole: typeof createRole;
  getRoleById: typeof getRoleById;
  getRoleByCode: typeof getRoleByCode;
  getRoles: typeof getRoles;
  updateRole: typeof updateRole;
  deleteRole: typeof deleteRole;
  getRolePermissions: typeof getRolePermissions;
  assignPermissionsToRole: typeof assignPermissionsToRole;
  removePermissionFromRole: typeof removePermissionFromRole;
  getUsersByRole: typeof getUsersByRole;
};