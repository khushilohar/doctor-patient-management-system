import PermissionRole from '../models/permission_roles_model';
import Role from '../models/roles_model';
import ResourceAction from '../models/resource_actions_model';
import Resource from '../models/resources_model';
import Action from '../models/actions_model';
import { PermissionRoleCreateInput } from '../schemas/permission_roles_schema';
import { Op } from 'sequelize';

// Create a single permission (role ↔ resource_action) assignment.
export async function createPermissionRole(data: PermissionRoleCreateInput) {
  return await PermissionRole.create(data as any);
}

// Retrieve a permission assignment by its primary key.
export async function getPermissionRoleById(id: number) {
  return await PermissionRole.findByPk(id, {
    include: [Role, ResourceAction]
  });
}

// Retrieve a permission assignment by role and resource_action IDs.
export async function getPermissionRoleByRoleAndResourceAction(roleId: number, resourceActionId: number) {
  return await PermissionRole.findOne({
    where: { role_id: roleId, resource_action_id: resourceActionId },
    include: [Role, ResourceAction]
  });
}

// Get paginated list of permission assignments.
export async function getPermissionRoles(
  where: any = {},
  limit: number = 10,
  offset: number = 0,
  includeAssociations: boolean = true
) {
  const options: any = { where, limit, offset };
  if (includeAssociations) {
    options.include = [
      Role,
      {
        model: ResourceAction,
        include: [Resource, Action] // optionally include the underlying resource and action
      }
    ];
  }
  return await PermissionRole.findAndCountAll(options);
}

// Update a permission assignment (rarely used; usually you delete and recreate).
export async function updatePermissionRole(id: number, data: Partial<PermissionRoleCreateInput>) {
  const pr = await PermissionRole.findByPk(id);
  if (!pr) throw new Error('Permission assignment not found');
  await pr.update(data);
  return pr;
}

// Delete a permission assignment by ID.
export async function deletePermissionRole(id: number) {
  return await PermissionRole.destroy({ where: { id } });
}

// Remove a specific permission (resource_action) from a role.
export async function removePermissionFromRole(roleId: number, resourceActionId: number) {
  return await PermissionRole.destroy({
    where: { role_id: roleId, resource_action_id: resourceActionId }
  });
}

// Remove all permissions from a role.
export async function removeAllPermissionsFromRole(roleId: number) {
  return await PermissionRole.destroy({ where: { role_id: roleId } });
}

// Bulk assign multiple permissions (resource_action IDs) to a role.
export async function assignPermissionsToRole(roleId: number, resourceActionIds: number[]) {
  // Avoid duplicates: fetch existing assignments
  const existing = await PermissionRole.findAll({
    where: { role_id: roleId, resource_action_id: { [Op.in]: resourceActionIds } },
    attributes: ['resource_action_id']
  });
  const existingRAIds = existing.map(e => e.resource_action_id);
  const newRAIds = resourceActionIds.filter(rid => !existingRAIds.includes(rid));

  if (newRAIds.length === 0) return [];

  const records = newRAIds.map(raId => ({
    role_id: roleId,
    resource_action_id: raId
  }));
  return await PermissionRole.bulkCreate(records);
}

// Get all resource_action IDs assigned to a role.
export async function getPermissionsByRole(roleId: number) {
  const permissions = await PermissionRole.findAll({
    where: { role_id: roleId },
    attributes: ['resource_action_id']
  });
  return permissions.map(p => p.resource_action_id);
}

// Get all role IDs that have a specific permission (resource_action).
export async function getRolesByPermission(resourceActionId: number) {
  const permissions = await PermissionRole.findAll({
    where: { resource_action_id: resourceActionId },
    attributes: ['role_id']
  });
  return permissions.map(p => p.role_id);
}

// Get detailed information about permissions assigned to a role.
export async function getDetailedPermissionsByRole(roleId: number) {
  const permissions = await PermissionRole.findAll({
    where: { role_id: roleId },
    include: [
      {
        model: ResourceAction,
        include: [Resource, Action]
      }
    ]
  });
  return permissions.map(p => (p as any).ResourceAction);
}

// Get all roles that have a specific permission, with role details.
export async function getRolesWithPermission(resourceActionId: number) {
  const permissions = await PermissionRole.findAll({
    where: { resource_action_id: resourceActionId },
    include: [Role]
  });
  return permissions.map(p => (p as any).Role);
}

// Export types for service layer
export type PermissionRoleCrud = {
  createPermissionRole: typeof createPermissionRole;
  getPermissionRoleById: typeof getPermissionRoleById;
  getPermissionRoleByRoleAndResourceAction: typeof getPermissionRoleByRoleAndResourceAction;
  getPermissionRoles: typeof getPermissionRoles;
  updatePermissionRole: typeof updatePermissionRole;
  deletePermissionRole: typeof deletePermissionRole;
  removePermissionFromRole: typeof removePermissionFromRole;
  removeAllPermissionsFromRole: typeof removeAllPermissionsFromRole;
  assignPermissionsToRole: typeof assignPermissionsToRole;
  getPermissionsByRole: typeof getPermissionsByRole;
  getRolesByPermission: typeof getRolesByPermission;
  getDetailedPermissionsByRole: typeof getDetailedPermissionsByRole;
  getRolesWithPermission: typeof getRolesWithPermission;
};