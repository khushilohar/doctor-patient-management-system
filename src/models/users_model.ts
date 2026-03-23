import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../config/db";

// Define the possible user types (matching the database ENUM)
type UserType = "super_admin" | "admin" | "patient" | "doctor" | "customer" | "shop_owner";

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  phone?: string;
  status: boolean;
  userType: UserType | null;
  is_verified: boolean;
  is_deleted: boolean;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public userType!: UserType | null;
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
      type: DataTypes.ENUM("super_admin", "admin", "patient", "doctor", "customer", "shop_owner"),
      allowNull: true,
      defaultValue: null,
      field: "user_type",
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