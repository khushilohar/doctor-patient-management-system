import { QueryInterface, DataTypes } from "sequelize";

export = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("resource_actions", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      resource_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "resources", key: "id" },
        onDelete: "CASCADE",
      },

      action_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "actions", key: "id" },
        onDelete: "CASCADE",
      },

      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addConstraint("resource_actions", {
      fields: ["resource_id", "action_id"],
      type: "unique",
      name: "unique_resource_action",
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("resource_actions");
  },
};