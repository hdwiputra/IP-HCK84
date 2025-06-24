"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("UserAnimes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      UserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      AnimeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Animes",
          key: "id",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      watch_status: {
        type: Sequelize.BOOLEAN,
      },
      score: {
        type: Sequelize.FLOAT,
      },
      episodes_watched: {
        type: Sequelize.INTEGER,
      },
      notes: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserAnimes");
  },
};
