import { QueryInterface } from "sequelize";

export const createResourceActions = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkInsert("resource_actions", [
    {
      resource_id: 1,
      action_id: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
};

export const getResourceActions = async (queryInterface: QueryInterface) => {
  return await queryInterface.sequelize.query(`SELECT * FROM resource_actions`);
};

export const updateResourceAction = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkUpdate(
    "resource_actions",
    { action_id: 2, updatedAt: new Date() },
    { resource_id: 1 }
  );
};

export const deleteResourceAction = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkDelete("resource_actions", { resource_id: 1 });
};