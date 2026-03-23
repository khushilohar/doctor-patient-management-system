"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("resource_actions", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

      resource_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "resources", key: "id" },
        onDelete: "CASCADE",
      },

      action_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "actions", key: "id" },
        onDelete: "CASCADE",
      },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addConstraint("resource_actions", {
      fields: ["resource_id", "action_id"],
      type: "unique",
      name: "unique_resource_action",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("resource_actions");
  },
};