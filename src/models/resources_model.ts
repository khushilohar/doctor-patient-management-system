import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db";

interface ResourceAttributes {
  id: number;
  name: string;
  code: string;
  description?: string;
}

interface ResourceCreationAttributes extends Optional<ResourceAttributes, "id"> {}

class Resource extends Model<ResourceAttributes, ResourceCreationAttributes>
  implements ResourceAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Resource.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING },
  },
  {
    sequelize,
    tableName: "resources",
  }
);

export default Resource;