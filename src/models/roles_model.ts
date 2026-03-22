import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db";

interface RoleAttributes {
  id: number;
  name: string;
  code: string;
  description?: string;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, "id"> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING },
  },
  {
    sequelize,
    tableName: "roles",
  }
);

export default Role;