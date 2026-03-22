import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";

class PermissionRole extends Model {
  public id!: number;
  public role_id!: number;
  public resource_action_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PermissionRole.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    role_id: { type: DataTypes.INTEGER, allowNull: false },
    resource_action_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: "permission_roles",
  }
);

export default PermissionRole;