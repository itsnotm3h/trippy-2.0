"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(` 
    CREATE TABLE IF NOT EXISTS users (
    user_id INT(11) NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
    last_name VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
    password VARCHAR(255) NOT NULL COLLATE 'latin1_swedish_ci',
    email VARCHAR(100) NOT NULL COLLATE 'latin1_swedish_ci',
    display_name VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
    auth_id VARCHAR(50) NOT NULL DEFAULT '-' COLLATE 'latin1_swedish_ci',
    invited_by INT(11) NULL DEFAULT NULL,
    status ENUM('PENDING','ACTIVE','DEACTIVATED') NOT NULL DEFAULT 'ACTIVE' COLLATE 'latin1_swedish_ci',
    PRIMARY KEY (user_id) USING BTREE,
    UNIQUE INDEX email (email) USING BTREE
  )
`);
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS users
      `);
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
