"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const resources = await queryInterface.sequelize.query(
      "SELECT id FROM resources",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const actions = await queryInterface.sequelize.query(
      "SELECT id FROM actions",
      { type: Sequelize.QueryTypes.SELECT }
    );

    const data = [];

    resources.forEach((r) => {
      actions.forEach((a) => {
        data.push({
          resource_id: r.id,
          action_id: a.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
    });

    await queryInterface.bulkInsert("resource_actions", data);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("resource_actions", null, {});
  },
};