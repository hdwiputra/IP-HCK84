"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Anime extends Model {
    static associate(models) {
      Anime.hasMany(models.UserAnime, { foreignKey: "AnimeId" });
    }
  }
  Anime.init(
    {
      mal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "mal_id is required" },
          isInt: { msg: "mal_id must be an integer" },
        },
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "URL is required" },
          notEmpty: { msg: "URL cannot be empty" },
        },
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Title is required" },
          notEmpty: { msg: "Title cannot be empty" },
        },
      },
      title_english: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title_japanese: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      trailer_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      genre: {
        type: DataTypes.ARRAY,
        allowNull: true,
      },
      synopsis: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      episodes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      duration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rating: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          isFloat: { msg: "Score must be a number" },
          min: { args: [0], msg: "Score cannot be negative" },
        },
      },
      rank: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: "Rank must be an integer" },
          min: { args: [1], msg: "Rank must be at least 1" },
        },
      },
      popularity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: "Popularity must be an integer" },
          min: { args: [1], msg: "Popularity must be at least 1" },
        },
      },
      aired_from: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: { msg: "Aired from must be a valid date" },
        },
      },
      aired_to: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: { msg: "Aired to must be a valid date" },
        },
      },
      season: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: "Year must be an integer" },
          min: { args: [1900], msg: "Year must be valid" },
        },
      },
    },
    {
      sequelize,
      modelName: "Anime",
    }
  );
  return Anime;
};
