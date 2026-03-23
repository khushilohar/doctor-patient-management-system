import UserRole from '../models/user_roles_model';
import User from '../models/users_model';
import Role from '../models/roles_model';
import { UserRoleCreateInput } from '../schemas/user_roles_schema';
import { Op } from 'sequelize';

// Create a single user-role assignment.
export async function createUserRole(data: UserRoleCreateInput) {
  return await UserRole.create(data as any);
}

// Retrieve a user-role assignment by its primary key.
export async function getUserRoleById(id: number) {
  return await UserRole.findByPk(id, {
    include: [User, Role]
  });
}

// Get paginated list of user-role assignments.
export async function getUserRoles(
  where: any = {},
  limit: number = 10,
  offset: number = 0,
  includeAssociations: boolean = true
) {
  const options: any = { where, limit, offset };
  if (includeAssociations) {
    options.include = [User, Role];
  }
  return await UserRole.findAndCountAll(options);
}

// Update a user-role assignment (rarely used; usually you delete and recreate).
export async function updateUserRole(id: number, data: Partial<UserRoleCreateInput>) {
  const ur = await UserRole.findByPk(id);
  if (!ur) throw new Error('UserRole assignment not found');
  await ur.update(data);
  return ur;
}

// Delete a specific user-role assignment by ID.
export async function deleteUserRole(id: number) {
  return await UserRole.destroy({ where: { id } });
}

// Remove a specific role from a user.
export async function removeRoleFromUser(userId: number, roleId: number) {
  return await UserRole.destroy({
    where: { user_id: userId, role_id: roleId }
  });
}

/**
 * Remove all roles from a user.
 * @param userId - User ID.
 * @returns Number of deleted rows.
 */
export async function removeAllRolesFromUser(userId: number) {
  return await UserRole.destroy({ where: { user_id: userId } });
}

// Bulk assign multiple roles to a user.
export async function assignRolesToUser(userId: number, roleIds: number[]) {
  // Optionally remove duplicates and existing assignments before bulk create
  const existing = await UserRole.findAll({
    where: { user_id: userId, role_id: { [Op.in]: roleIds } },
    attributes: ['role_id']
  });
  const existingRoleIds = existing.map(er => er.role_id);
  const newRoleIds = roleIds.filter(rid => !existingRoleIds.includes(rid));

  if (newRoleIds.length === 0) return [];

  const records = newRoleIds.map(roleId => ({
    user_id: userId,
    role_id: roleId
  }));
  return await UserRole.bulkCreate(records);
}

// Get all role IDs assigned to a user.
export async function getRolesByUser(userId: number) {
  const userRoles = await UserRole.findAll({
    where: { user_id: userId },
    attributes: ['role_id']
  });
  return userRoles.map(ur => ur.role_id);
}

// Get all users that have a specific role.
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

// Get all roles with their assigned users (useful for admin reports).
export async function getRolesWithUsers(
  roleId?: number,
  limit: number = 10,
  offset: number = 0
) {
  const where: any = {};
  if (roleId) where.id = roleId;

  const roles = await Role.findAll({
    where,
    limit,
    offset,
    include: [
      {
        model: User,
        through: { attributes: [] },
      },
    ],
  });
  return roles;
}

// Export types for service layer
export type UserRoleCrud = {
  createUserRole: typeof createUserRole;
  getUserRoleById: typeof getUserRoleById;
  getUserRoles: typeof getUserRoles;
  updateUserRole: typeof updateUserRole;
  deleteUserRole: typeof deleteUserRole;
  removeRoleFromUser: typeof removeRoleFromUser;
  removeAllRolesFromUser: typeof removeAllRolesFromUser;
  assignRolesToUser: typeof assignRolesToUser;
  getRolesByUser: typeof getRolesByUser;
  getUsersByRole: typeof getUsersByRole;
  getRolesWithUsers: typeof getRolesWithUsers;
};