"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("permission_roles", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "roles", key: "id" },
        onDelete: "CASCADE",
      },

      resource_action_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "resource_actions", key: "id" },
        onDelete: "CASCADE",
      },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addConstraint("permission_roles", {
      fields: ["role_id", "resource_action_id"],
      type: "unique",
      name: "unique_permission_role",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("permission_roles");
  },
};