import { QueryInterface, DataTypes } from "sequelize";

export = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("roles", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      name: { type: DataTypes.STRING, allowNull: false },

      code: { type: DataTypes.STRING, allowNull: false, unique: true },

      description: { type: DataTypes.STRING },

      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("roles");
  },
};