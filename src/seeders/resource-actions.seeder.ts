export = {
  up: async (queryInterface: any, Sequelize: any) => {
    const resources = await queryInterface.sequelize.query(`SELECT id, code FROM resources`, { type: Sequelize.QueryTypes.SELECT });
    const actions = await queryInterface.sequelize.query(`SELECT id, code FROM actions`, { type: Sequelize.QueryTypes.SELECT });

    const data: any[] = [];

    for (const r of resources) {
      for (const a of actions) {
        data.push({
          resource_id: r.id,
          action_id: a.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert("resource_actions", data);
  },

  down: async (queryInterface: any) => {
    await queryInterface.bulkDelete("resource_actions", {});
  },
};