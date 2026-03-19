export = {
  up: async (queryInterface: any) => {
    await queryInterface.bulkInsert("resources", [
      { name: "User", code: "user", createdAt: new Date(), updatedAt: new Date() },
      { name: "Consultation", code: "consultation", createdAt: new Date(), updatedAt: new Date() },
      { name: "Order", code: "order", createdAt: new Date(), updatedAt: new Date() },
      { name: "Inventory", code: "inventory", createdAt: new Date(), updatedAt: new Date() },
      { name: "Network", code: "network", createdAt: new Date(), updatedAt: new Date() },
    ]);
  },

  down: async (queryInterface: any) => {
    await queryInterface.bulkDelete("resources", {});
  },
};