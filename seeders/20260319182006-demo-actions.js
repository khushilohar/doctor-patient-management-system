"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("actions", [
      { name: "Create", code: "create", createdAt: new Date(), updatedAt: new Date() },
      { name: "Read", code: "read", createdAt: new Date(), updatedAt: new Date() },
      { name: "Update", code: "update", createdAt: new Date(), updatedAt: new Date() },
      { name: "Delete", code: "delete", createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("actions", null, {});
  },
};