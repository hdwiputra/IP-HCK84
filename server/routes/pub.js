const express = require("express");
const PubController = require("../controllers/pubController");
const router = express.Router();
const authentication = require("../middlewares/authentication");

router.get("/animes", PubController.getAnimes);
router.get("/animes/:id", PubController.getAnimesId);
router.get("/genres", PubController.getGenre);
router.get("/recommendation", authentication, PubController.getRecommendations);

module.exports = router;
