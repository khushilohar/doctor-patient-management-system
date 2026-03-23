"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("resources", [
      { name: "User", code: "user", createdAt: new Date(), updatedAt: new Date() },
      { name: "Consultation", code: "consultation", createdAt: new Date(), updatedAt: new Date() },
      { name: "Order", code: "order", createdAt: new Date(), updatedAt: new Date() },
      { name: "Inventory", code: "inventory", createdAt: new Date(), updatedAt: new Date() },
      { name: "Network", code: "network", createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("resources", null, {});
  },
};