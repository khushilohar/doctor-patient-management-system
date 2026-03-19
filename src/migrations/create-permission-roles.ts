import { QueryInterface, DataTypes } from "sequelize";

export = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("permission_roles", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "roles", key: "id" },
        onDelete: "CASCADE",
      },

      resource_action_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "resource_actions", key: "id" },
        onDelete: "CASCADE",
      },

      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addConstraint("permission_roles", {
      fields: ["role_id", "resource_action_id"],
      type: "unique",
      name: "unique_permission_role",
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("permission_roles");
  },
};