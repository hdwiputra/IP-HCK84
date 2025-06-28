"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Genre extends Model {
    static associate(models) {
      Genre.hasMany(models.UserGenre, { foreignKey: "GenreId" });
    }
  }
  Genre.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Genre name is required" },
          notEmpty: { msg: "Genre name cannot be empty" },
        },
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Genre name is required" },
          notEmpty: { msg: "Genre name cannot be empty" },
          isUrl: { msg: "Genre URL must be a valid URL" },
        },
      },
      mal_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "mal_id is required" },
          isInt: { msg: "mal_id must be an integer" },
        },
      },
      icon: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Icon is required" },
          isInt: { msg: "Icon must be an integer" },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Description is required" },
          isInt: { msg: "Description must be an integer" },
        },
      },
    },
    {
      sequelize,
      modelName: "Genre",
    }
  );
  return Genre;
};
