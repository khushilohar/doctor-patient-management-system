import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";

class UserRole extends Model {
  public id!: number;
  public user_id!: number;
  public role_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserRole.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: "user_roles",
  }
);

export default UserRole;