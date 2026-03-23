"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = await queryInterface.sequelize.query(
      "SELECT id, code FROM roles",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const resourceActions = await queryInterface.sequelize.query(
      "SELECT id FROM resource_actions",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const superAdmin = roles.find((r) => r.code === "super_admin");

    const data = resourceActions.map((ra) => ({
      role_id: superAdmin.id,
      resource_action_id: ra.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("permission_roles", data);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("permission_roles", null, {});
  },
};