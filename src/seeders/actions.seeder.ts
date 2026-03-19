export = {
  up: async (queryInterface: any) => {
    await queryInterface.bulkInsert("actions", [
      { name: "Create", code: "create", createdAt: new Date(), updatedAt: new Date() },
      { name: "Read", code: "read", createdAt: new Date(), updatedAt: new Date() },
      { name: "Update", code: "update", createdAt: new Date(), updatedAt: new Date() },
      { name: "Delete", code: "delete", createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface: any) => {
    await queryInterface.bulkDelete("actions", {});
  },
};