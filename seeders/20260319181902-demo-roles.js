"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("roles", [
      { name: "Super Admin", code: "super_admin", createdAt: new Date(), updatedAt: new Date() },
      { name: "Admin", code: "admin", createdAt: new Date(), updatedAt: new Date() },
      { name: "Patient", code: "patient", createdAt: new Date(), updatedAt: new Date() },
      { name: "Doctor", code: "doctor", createdAt: new Date(), updatedAt: new Date() },
      { name: "Customer", code: "customer", createdAt: new Date(), updatedAt: new Date() },
      { name: "Shop Owner", code: "shop_owner", createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};