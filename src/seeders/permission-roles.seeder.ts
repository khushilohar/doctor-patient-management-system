export = {
  up: async (queryInterface: any, Sequelize: any) => {
    const roles: any[] = await queryInterface.sequelize.query(
      `SELECT id, code FROM roles`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const resourceActions: any[] = await queryInterface.sequelize.query(
      `SELECT id FROM resource_actions`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const superAdmin = roles.find(r => r.code === "super_admin");

    const data = resourceActions.map((ra) => ({
      role_id: superAdmin.id,
      resource_action_id: ra.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("permission_roles", data);
  },

  down: async (queryInterface: any) => {
    await queryInterface.bulkDelete("permission_roles", {});
  },
};