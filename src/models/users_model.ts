import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db";

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  phone?: string;
  status: boolean;
  userType: "superadmin" | "admin" | "user"; 
  is_verified: boolean;
  is_deleted: boolean;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public userType!: "superadmin" | "admin" | "user";
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public phone?: string;
  public status!: boolean;
 
  public is_verified!: boolean;
  public is_deleted!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    status: { type: DataTypes.BOOLEAN, defaultValue: true },
    userType: {
    type: DataTypes.ENUM("superadmin", "admin", "user"),
    allowNull: false,
    defaultValue: "user",
    },
    is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    tableName: "users",
  }
);

export default User;