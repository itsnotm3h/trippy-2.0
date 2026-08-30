"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users','referal_code',{
      type:Sequelize.STRING(50),
      allowNull:true,
    })
  },

async down (queryInterface, Sequelize) {
  return [
    queryInterface.sequelize.query(`ALTER TABLE users DROP COLUMN referal_code`)
  ];
}
}
