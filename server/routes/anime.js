const express = require("express");
const animeController = require("../controllers/animeController");
const router = express.Router();
const authentication = require("../middlewares/authentication");

router.use(authentication);
router.get("/genres/", animeController.getMyGenres);
router.post("/genres/:id", animeController.postMyGenres);
router.delete("/genres/:id", animeController.deleteMyGenres);
router.get("/recommendation", animeController.getRecommendations);
router.get("/", animeController.getMyAnimes);
router.post("/:id", animeController.postMyAnimes);
router.get("/:id", animeController.getMyAnimesId);
router.put("/:id", animeController.putMyAnimes);
router.delete("/:id", animeController.deleteMyAnimes);

module.exports = router;
