import { QueryInterface } from "sequelize";

export const createUsers = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkInsert("users", [
    {
      name: "John Doe",
      email: "john@example.com",
      password: "hashed_password",
      phone: "9999999999",
      status: true,
      userType: "superadmin",
      is_verified: true,
      is_deleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      
    },
  ]);
};

export const getUsers = async (queryInterface: QueryInterface) => {
  return await queryInterface.sequelize.query(`SELECT * FROM users`);
};

export const updateUser = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkUpdate(
    "users",
    { name: "Updated Name", updatedAt: new Date() },
    { email: "john@example.com" }
  );
};

export const deleteUser = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkDelete("users", { email: "john@example.com" });
};