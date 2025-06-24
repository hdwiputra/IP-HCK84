const { decoded } = require("../helpers/jwt");
const { User } = require("../models");

async function authentication(req, res, next) {
  try {
    const { authorization } = req.headers;
    console.log(authorization);
    if (!authorization) {
      throw { name: "Unauthorized", message: "Invalid token" };
    }

    const rawToken = authorization.split(" ");
    const tokenType = rawToken[0];
    const tokenValue = rawToken[1];

    if (tokenType !== "Bearer") {
      throw { name: "Unauthorized", message: "Invalid token" };
    }

    const result = decoded(tokenValue);
    console.log(result, "<<< result");

    const user = await User.findByPk(result.id);
    if (!user) {
      throw { name: "Unauthorized", message: "Invalid token" };
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authentication;
