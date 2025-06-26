const express = require("express");
const animeController = require("../controllers/animeController");
const router = express.Router();
const authentication = require("../middlewares/authentication");

router.use(authentication);
router.get("/", animeController.getMyAnimes);
router.post("/genres/:id", animeController.postMyGenres);
router.get("/recommendation", animeController.getRecommendations);
router.post("/:id", animeController.postMyAnimes);
router.get("/:id", animeController.getMyAnimesId);
router.put("/:id", animeController.putMyAnimes);
router.delete("/:id", animeController.deleteMyAnimes);

module.exports = router;
