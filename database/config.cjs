// database/config.cjs
require('dotenv').config();

module.exports = {
  development: {
    dialect: 'mariadb',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    migrationStorage: 'sequelize',
    migrationStorageTableName: 'SequelizeMeta',
  },

  test: {
    dialect: 'sqlite',
    storage: ':memory:',
  },

  production: {
    dialect: 'mariadb',
    use_env_variable: 'DATABASE_URL',

    migrationStorage: 'sequelize',
    migrationStorageTableName: 'SequelizeMeta',
  },
};