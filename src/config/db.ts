
import { Sequelize } from 'sequelize';
import * as config from '../../config/config.json'; // Adjust path as needed

const env = process.env.NODE_ENV || 'development';
const dbConfig = (config as any)[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging || false,
  }
);

export default sequelize;