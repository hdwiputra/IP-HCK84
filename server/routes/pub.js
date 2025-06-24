const express = require("express");
const PubController = require("../controllers/pubController");
const router = express.Router();

router.get("/animes", PubController.getAnimes);
router.get("/animes/:id", PubController.getAnimesId);
router.get("/genres", PubController.getGenre);

module.exports = router;
