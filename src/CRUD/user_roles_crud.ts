import { QueryInterface } from "sequelize";

export const createUserRoles = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkInsert("user_roles", [
    {
      user_id: 1,
      role_id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
};

export const getUserRoles = async (queryInterface: QueryInterface) => {
  return await queryInterface.sequelize.query(`SELECT * FROM user_roles`);
};

export const updateUserRole = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkUpdate(
    "user_roles",
    { role_id: 2, updatedAt: new Date() },
    { user_id: 1 }
  );
};

export const deleteUserRole = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkDelete("user_roles", { user_id: 1 });
};