"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      phone: { type: Sequelize.STRING },
      status: { type: Sequelize.BOOLEAN, defaultValue: true },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      // New column: user_type (ENUM matching the roles)
      user_type: {
        type: Sequelize.ENUM(
          'super_admin',
          'admin',
          'patient',
          'doctor',
          'customer',
          'shop_owner'
        ),
        allowNull: true,        // can be null if user hasn't been assigned a primary role yet
        defaultValue: null,
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // Optional: add an index on user_type for faster queries
    await queryInterface.addIndex("users", ["user_type"]);
  },

  async down(queryInterface) {
    // Drop the table; the ENUM will be removed automatically
    await queryInterface.dropTable("users");
  },
};