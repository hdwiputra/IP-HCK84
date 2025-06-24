"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserAnime extends Model {
    static associate(models) {
      UserAnime.belongsTo(models.User, { foreignKey: "UserId" });
      UserAnime.belongsTo(models.Anime, { foreignKey: "AnimeId" });
    }
  }
  UserAnime.init(
    {
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "UserId is required" },
          isInt: { msg: "UserId must be an integer" },
        },
      },
      AnimeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "AnimeId is required" },
          isInt: { msg: "AnimeId must be an integer" },
        },
      },
      watch_status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      score: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
          isInt: { msg: "Score must be an integer" },
          min: { args: [0], msg: "Score cannot be negative" },
        },
      },
      episodes_watched: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: { msg: "Episodes watched must be an integer" },
          min: { args: [0], msg: "Episodes watched cannot be negative" },
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "UserAnime",
    }
  );
  return UserAnime;
};
