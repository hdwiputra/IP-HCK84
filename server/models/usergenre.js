"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserGenre extends Model {
    static associate(models) {
      UserGenre.belongsTo(models.User, { foreignKey: "UserId" });
      UserGenre.belongsTo(models.Genre, { foreignKey: "GenreId" });
    }
  }
  UserGenre.init(
    {
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "UserId is required" },
          isInt: { msg: "UserId must be an integer" },
        },
      },
      GenreId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "GenreId is required" },
          isInt: { msg: "GenreId must be an integer" },
        },
      },
    },
    {
      sequelize,
      modelName: "UserGenre",
    }
  );
  return UserGenre;
};
