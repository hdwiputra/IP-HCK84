"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.UserGenre, { foreignKey: "UserId" });
      User.hasMany(models.UserAnime, { foreignKey: "UserId" });
    }
  }
  User.init(
    {
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Full name is required" },
          notEmpty: { msg: "Full name cannot be empty" },
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: "Username must be unique" },
        validate: {
          notNull: { msg: "Username is required" },
          notEmpty: { msg: "Username cannot be empty" },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: "Email must be unique" },
        validate: {
          notNull: { msg: "Email is required" },
          notEmpty: { msg: "Email cannot be empty" },
          isEmail: { msg: "Email must be a valid email address" },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "Password is required" },
          notEmpty: { msg: "Password cannot be empty" },
          len: { args: [6, 100], msg: "Password must be at least 6 characters" },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
