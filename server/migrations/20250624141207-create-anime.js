"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Animes", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      mal_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      title_english: {
        type: Sequelize.STRING,
        unique: true,
      },
      title_japanese: {
        type: Sequelize.STRING,
        unique: true,
      },
      image_url: {
        type: Sequelize.STRING,
      },
      trailer_url: {
        type: Sequelize.STRING,
      },
      synopsis: {
        type: Sequelize.TEXT,
      },
      type: {
        type: Sequelize.STRING,
      },
      episodes: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.STRING,
      },
      source: {
        type: Sequelize.STRING,
      },
      duration: {
        type: Sequelize.STRING,
      },
      rating: {
        type: Sequelize.STRING,
      },
      score: {
        type: Sequelize.FLOAT,
      },
      rank: {
        type: Sequelize.INTEGER,
      },
      popularity: {
        type: Sequelize.INTEGER,
      },
      aired_from: {
        type: Sequelize.DATE,
      },
      aired_to: {
        type: Sequelize.DATE,
      },
      season: {
        type: Sequelize.STRING,
      },
      year: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("Animes");
  },
};
