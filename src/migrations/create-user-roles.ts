import { QueryInterface, DataTypes } from "sequelize";

export = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("user_roles", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },

      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "roles", key: "id" },
        onDelete: "CASCADE",
      },

      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });

    await queryInterface.addConstraint("user_roles", {
      fields: ["user_id", "role_id"],
      type: "unique",
      name: "unique_user_role",
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("user_roles");
  },
};