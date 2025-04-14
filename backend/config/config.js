require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_DEV_USERNAME || "root",
    password: process.env.DB_DEV_PASSWORD || "root",
    database: process.env.DB_DEV_DATABASE || "trinity",
    host: process.env.DB_DEV_HOST || "localhost",
    dialect: process.env.DB_DEV_DIALECT || "mysql"
  },
  test: {
    username: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_DATABASE || "trinity_test",
    host: process.env.DB_HOST || "localhost",
    dialect: process.env.DB_DIALECT || "mysql"
  },
  production: {
    username: process.env.DB_PROD_USERNAME || "root",
    password: process.env.DB_PROD_PASSWORD || "root",
    database: process.env.DB_PROD_DATABASE || "trinity_production",
    host: process.env.DB_PROD_HOST || "localhost",
    dialect: process.env.DB_PROD_DIALECT || "mysql"
  }
};
