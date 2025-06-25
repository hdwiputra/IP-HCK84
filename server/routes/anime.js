const express = require("express");
const animeController = require("../controllers/animeController");
const router = express.Router();
const authentication = require("../middlewares/authentication");

router.use(authentication);
router.post("/:id", animeController.postMyAnimes);
router.get("/", animeController.getMyAnimes);
router.put("/:id", animeController.putMyAnimes);
router.delete("/:id", animeController.deleteMyAnimes);
router.post("/genres/:id", animeController.postMyGenres);
router.get("/recommendation", animeController.getRecommendations);

module.exports = router;
