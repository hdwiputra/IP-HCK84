const { comparePass } = require("../helpers/bcrypt");
const { token } = require("../helpers/jwt");
const { User } = require("../models");
const { Op } = require("sequelize");

class UserController {
  static async register(req, res, next) {
    try {
      const { fullName, username, email, password } = req.body;

      let data = await User.create({
        fullName,
        username,
        email,
        password,
      });

      data = data.toJSON();
      delete data.password;

      res.status(201).json({
        message: "User created successfully",
        user: data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { username, email, password } = req.body;
      console.log(email, username, password, "<<<< email/username/password");

      if (!email && !username) {
        throw { name: "BadRequest", message: "Email or Username is required" };
      }
      console.log(email, username, password, "<<<< email/username/password");

      if (!password) {
        throw { name: "BadRequest", message: "Password is required" };
      }
      console.log(email, username, password, "<<<< email/username/password");

      let data;
      if (username) {
        data = await User.findOne({
          where: {
            username,
          },
        });
      } else if (email) {
        data = await User.findOne({
          where: {
            email,
          },
        });
      }

      if (!data) {
        throw {
          name: "Unauthorized",
          message: "Invalid email/username/password",
        };
      }

      let comparePassword = comparePass(password, data.password);
      if (!comparePassword) {
        throw {
          name: "Unauthorized",
          message: "Invalid email/username/password",
        };
      }

      const access_token = token({ id: data.id });
      data = data.toJSON();
      delete data.password;
      res.status(200).json({ access_token, user: data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
