const { comparePass } = require("../helpers/bcrypt");
const { token } = require("../helpers/jwt");
const { User } = require("../models");
const { Op } = require("sequelize");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

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

  static async googleLogin(req, res, next) {
    try {
      if (!GOOGLE_CLIENT_ID) {
        throw new Error("GOOGLE_CLIENT_ID not found in environment variables");
      }

      if (!req.body.googleToken) {
        throw new Error("No googleToken in request body");
      }

      const ticket = await client.verifyIdToken({
        idToken: req.body.googleToken,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      console.log("Google payload email:", payload.email);

      let user = await User.findOne({
        where: {
          email: payload.email,
        },
      });

      if (!user) {
        console.log("Creating new user for:", payload.email);
        user = await User.create(
          {
            fullName: payload.name,
            username: payload.name
              .split(" ")
              .map((word, i, arr) => (i < arr.length - 1 ? word[0] : word))
              .join("")
              .toLowerCase(),
            email: payload.email,
            password: Math.random().toString(),
          },
          {
            hooks: false,
          }
        );
      }

      const access_token = token({ id: user.id });
      const userData = user.toJSON();
      delete userData.password;

      res.status(200).json({
        message: "Login Success",
        access_token,
        user: userData,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
