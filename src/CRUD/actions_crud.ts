import { QueryInterface } from "sequelize";

export const createActions = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkInsert("actions", [
    {
      name: "Create",
      code: "create",
      description: "Create action",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
};

export const getActions = async (queryInterface: QueryInterface) => {
  return await queryInterface.sequelize.query(`SELECT * FROM actions`);
};

export const updateAction = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkUpdate(
    "actions",
    { description: "Updated action", updatedAt: new Date() },
    { code: "create" }
  );
};

export const deleteAction = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkDelete("actions", { code: "create" });
};