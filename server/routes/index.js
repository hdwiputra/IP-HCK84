const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const routePub = require("./pub");
// const routeCuisine = require("./cuisines");
// const routeCategory = require("./categories");
// const { isOwnerorAdmin } = require("../middlewares/authorization");

router.post("/register", UserController.register);
router.post("/login", UserController.login);

router.use("/pub", routePub);
// router.use("/cuisines", routeCuisine);
// router.use("/categories", routeCategory);

module.exports = router;
