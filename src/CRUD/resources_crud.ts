import { QueryInterface } from "sequelize";

export const createResources = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkInsert("resources", [
    {
      name: "User",
      code: "user",
      description: "User resource",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
};

export const getResources = async (queryInterface: QueryInterface) => {
  return await queryInterface.sequelize.query(`SELECT * FROM resources`);
};

export const updateResource = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkUpdate(
    "resources",
    { description: "Updated resource", updatedAt: new Date() },
    { code: "user" }
  );
};

export const deleteResource = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkDelete("resources", { code: "user" });
};