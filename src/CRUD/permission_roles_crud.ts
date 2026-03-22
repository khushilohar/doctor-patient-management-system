import { QueryInterface } from "sequelize";

export const createPermissionRoles = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkInsert("permission_roles", [
    {
      role_id: 1,
      resource_action_id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
};

export const getPermissionRoles = async (queryInterface: QueryInterface) => {
  return await queryInterface.sequelize.query(`SELECT * FROM permission_roles`);
};

export const updatePermissionRole = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkUpdate(
    "permission_roles",
    { role_id: 2, updatedAt: new Date() },
    { resource_action_id: 1 }
  );
};

export const deletePermissionRole = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkDelete("permission_roles", {
    resource_action_id: 1,
  });
};