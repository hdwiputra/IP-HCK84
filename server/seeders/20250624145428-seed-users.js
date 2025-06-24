"use strict";

const { hashPass, comparePass } = require("../helpers/bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let data = [
      {
        fullName: "Gregory Godfrey",
        username: "gregxgod",
        email: "gregxxx@gmail.com",
        password: "123",
      },
    ];

    data[0].password = hashPass(data[0].password);
    data = data.map((el) => {
      el.createdAt = el.updatedAt = new Date();
      return el;
    });

    await queryInterface.bulkInsert("Users", data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
