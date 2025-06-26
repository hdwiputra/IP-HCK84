const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const routePub = require("./pub");
const routeAnime = require("./anime");

router.post("/register", UserController.register);
router.post("/login", UserController.login);

router.use("/pub", routePub);
router.use("/animes", routeAnime);

module.exports = router;
