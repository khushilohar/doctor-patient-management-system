import { Model, DataTypes } from "sequelize";
import sequelize from "../config/db";

class ResourceAction extends Model {
  public id!: number;
  public resource_id!: number;
  public action_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ResourceAction.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    resource_id: { type: DataTypes.INTEGER, allowNull: false },
    action_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,
    tableName: "resource_actions",
  }
);

export default ResourceAction;