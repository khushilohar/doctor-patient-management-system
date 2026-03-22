import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db";

interface ActionAttributes {
  id: number;
  name: string;
  code: string;
  description?: string;
}

interface ActionCreationAttributes extends Optional<ActionAttributes, "id"> {}

class Action extends Model<ActionAttributes, ActionCreationAttributes>
  implements ActionAttributes {
  public id!: number;
  public name!: string;
  public code!: string;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Action.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.STRING },
  },
  {
    sequelize,
    tableName: "actions",
  }
);

export default Action;