const e = require("express");
const { User, UserAnime, Anime, UserGenre, Genre } = require("../models");

class animeController {
  static async postMyAnimes(req, res, next) {
    try {
      const { id } = req.params;
      const UserId = req.user.id;

      let anime = await Anime.findByPk(id);
      if (!anime) {
        throw { name: "Not Found", message: "Anime not found" };
      }

      let newMyAnime = await UserAnime.create({
        UserId,
        AnimeId: id,
      });
      newMyAnime = newMyAnime.toJSON();
      delete newMyAnime.createdAt;
      delete newMyAnime.updatedAt;
      res.status(201).json(newMyAnime);
    } catch (error) {
      next(error);
    }
  }
  static async getMyAnimes(req, res, next) {
    try {
      let myAnimes = await UserAnime.findAll({
        attributes: { exclude: ["createdAt", "updatedAt"] },
        include: {
          model: Anime,
          attributes: { exclude: ["id", "createdAt", "updatedAt"] },
        },
        where: {
          UserId: req.user.id,
        },
      });
      res.status(200).json(myAnimes);
    } catch (error) {
      next(error);
    }
  }
  static async putMyAnimes(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      let anime = await UserAnime.findByPk(id);
      if (!anime) {
        throw { name: "Not Found", message: "Anime not found" };
      }

      let animeData = await Anime.findByPk(anime.AnimeId);
      console.log(animeData, "<<<< anime");

      if (!req.body) {
        throw { name: "Bad Request", message: "Anime data cannot be empty" };
      }

      let { watch_status, score, episodes_watched, notes } = req.body;

      if (!score) {
        throw { name: "Bad Request", message: "Score cannot be empty" };
      }

      if (!episodes_watched) {
        throw {
          name: "Bad Request",
          message: "Episodes watched cannot be empty",
        };
      }

      if (episodes_watched > animeData.episodes) {
        throw {
          name: "Bad Request",
          message: "Episodes watched cannot exceed total episodes",
        };
      }

      if (episodes_watched == animeData.episodes) {
        watch_status = "Completed";
      } else if (episodes_watched < animeData.episodes) {
        watch_status = "In Progress";
      }

      if (anime.UserId != userId) {
        throw { name: "Forbidden", message: "You're not authorized" };
      }

      await anime.update({
        watch_status,
        score,
        episodes_watched,
        notes,
      });
      res.status(200).json({ message: "Anime has been updated" });
    } catch (error) {
      next(error);
    }
  }
  static async deleteMyAnimes(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      let anime = await UserAnime.findByPk(id);
      if (!anime) {
        throw { name: "Not Found", message: "Anime not found" };
      }

      if (anime.UserId != userId) {
        throw { name: "Forbidden", message: "You're not authorized" };
      }

      await UserAnime.destroy({
        where: {
          id,
        },
      });

      res.status(200).json({ message: "Anime has been deleted" });
    } catch (error) {
      next(error);
    }
  }
  static async postMyGenres(req, res, next) {
    try {
      const { id } = req.params;
      const UserId = req.user.id;

      let genres = await Genre.findAll();
      if (!genres) {
        throw { name: "Not Found", message: "Genres not found" };
      }

      let newMyGenre = await UserGenre.create({
        UserId,
        GenreId: id,
      });
      newMyGenre = newMyGenre.toJSON();
      delete newMyGenre.createdAt;
      delete newMyGenre.updatedAt;
      res.status(201).json(newMyGenre);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = animeController;
