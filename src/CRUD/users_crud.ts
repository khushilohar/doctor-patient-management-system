import User from '../models/users_model';
import Role from '../models/roles_model';
import { UserCreateInput, UserUpdateInput } from '../schemas/users_schema';
import bcrypt from 'bcrypt';

// Create a new user.
export async function createUser(data: UserCreateInput) {
  // Hash password before saving (if present)
  if (data.password) {
    const saltRounds = 10;
    data.password = await bcrypt.hash(data.password, saltRounds);
  }
  return await User.create(data as any);
}

// Retrieve a user by primary key.
export async function getUserById(id: number, includeRoles: boolean = true) {
  const options: any = { where: { id, is_deleted: false } };
  if (includeRoles) {
    options.include = [{ model: Role, through: { attributes: [] } }];
  }
  return await User.findByPk(id, options);
}

// Retrieve a user by email address.
export async function getUserByEmail(email: string, includeRoles: boolean = true) {
  const options: any = { where: { email, is_deleted: false } };
  if (includeRoles) {
    options.include = [{ model: Role, through: { attributes: [] } }];
  }
  return await User.findOne(options);
}

// Get paginated list of users.
export async function getUsers(
  where: any = {},
  limit: number = 10,
  offset: number = 0,
  includeRoles: boolean = false
) {
  const options: any = { where: { ...where, is_deleted: false }, limit, offset };
  if (includeRoles) {
    options.include = [{ model: Role, through: { attributes: [] } }];
  }
  return await User.findAndCountAll(options);
}

// Update an existing user.
export async function updateUser(id: number, data: UserUpdateInput) {
  const user = await getUserById(id, false);
  if (!user) throw new Error('User not found');

  // If password is being updated, hash it
  if (data.password) {
    const saltRounds = 10;
    data.password = await bcrypt.hash(data.password, saltRounds);
  }

  await user.update(data);
  return user;
}

// Delete a user (soft delete by default, hard delete if soft=false)
export async function deleteUser(id: number, soft: boolean = true) {
  if (soft) {
    const [updatedCount] = await User.update(
      { is_deleted: true },
      { where: { id, is_deleted: false } }
    );
    return updatedCount;
  } else {
    return await User.destroy({ where: { id } });
  }
}

// Restore a soft-deleted user.
export async function restoreUser(id: number) {
  const user = await User.findOne({ where: { id, is_deleted: true } });
  if (!user) throw new Error('User not found or not deleted');
  await user.update({ is_deleted: false });
  return user;
}

// Change user password (assumes new password is already hashed)
export async function updateUserPassword(id: number, newHashedPassword: string) {
  const user = await getUserById(id, false);
  if (!user) throw new Error('User not found');
  await user.update({ password: newHashedPassword });
  return user;
}

export async function getUserWithRoles(id: number) {
  return await getUserById(id, true);
}

// Export types for service layer
export type UserCrud = {
  createUser: typeof createUser;
  getUserById: typeof getUserById;
  getUserByEmail: typeof getUserByEmail;
  getUsers: typeof getUsers;
  updateUser: typeof updateUser;
  deleteUser: typeof deleteUser;
  restoreUser: typeof restoreUser;
  updateUserPassword: typeof updateUserPassword;
  getUserWithRoles: typeof getUserWithRoles;
};