import { QueryInterface } from "sequelize";

export const createRoles = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkInsert("roles", [
    {
      name: "Admin",
      code: "admin",
      description: "Admin role",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
};

export const getRoles = async (queryInterface: QueryInterface) => {
  return await queryInterface.sequelize.query(`SELECT * FROM roles`);
};

export const updateRole = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkUpdate(
    "roles",
    { description: "Updated role", updatedAt: new Date() },
    { code: "admin" }
  );
};

export const deleteRole = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkDelete("roles", { code: "admin" });
};