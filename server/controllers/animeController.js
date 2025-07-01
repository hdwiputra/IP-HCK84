const express = require("express");
const { User, UserAnime, Anime, UserGenre, Genre } = require("../models");
const { generateContent } = require("../helpers/gemini");
const { Sequelize } = require("sequelize");

class animeController {
  static async postMyAnimes(req, res, next) {
    try {
      const { id } = req.params;
      const UserId = req.user.id;

      const anime = await Anime.findByPk(id);
      if (!anime) {
        throw { name: "Not Found", message: "Anime not found" };
      }

      // Check if the anime is already added by the user
      const existing = await UserAnime.findOne({
        where: {
          UserId,
          AnimeId: id,
        },
      });

      if (existing) {
        throw { name: "Bad Request", message: "Anime already in your list" };
      }

      // Create new user-anime entry
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

  static async getMyAnimesId(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      let myAnimesId = await UserAnime.findByPk(id, {
        attributes: { exclude: ["createdAt", "updatedAt"] },
        include: {
          model: Anime,
          attributes: { exclude: ["id", "createdAt", "updatedAt"] },
        },
      });

      if (!myAnimesId) {
        throw { name: "Not Found", message: "Anime not found" };
      }
      if (myAnimesId.UserId != userId) {
        throw {
          name: "Forbidden",
          message: "You are not authorized",
        };
      }
      res.status(200).json(myAnimesId);
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
  static async getMyGenres(req, res, next) {
    try {
      const UserId = req.user.id;
      let genres = await UserGenre.findAll({
        where: {
          UserId,
        },
        include: [Genre],
      });
      if (genres.length === 0) {
        throw { name: "Not Found", message: "Genres not found" };
      }
      res.status(200).json(genres);
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
  static async deleteMyGenres(req, res, next) {
    try {
      const { id } = req.params;
      const UserId = req.user.id;

      let genres = await UserGenre.findOne({
        where: {
          UserId,
          GenreId: id,
        },
      });
      if (!genres) {
        throw { name: "Not Found", message: "Genres not found" };
      }

      await UserGenre.destroy({
        where: {
          UserId,
          GenreId: id,
        },
      });
      res.status(200).json({ message: "Genres deleted from favorite" });
    } catch (error) {
      next(error);
    }
  }

  static async getRecommendations(req, res, next) {
    try {
      const userId = req.user.id;

      // Get user's favorite genres
      const userGenres = await UserGenre.findAll({
        where: { UserId: userId },
        include: [{ model: Genre, attributes: ["name"] }],
      });

      if (userGenres.length === 0) {
        return res.status(400).json({
          message: "Please add some favorite genres first",
        });
      }

      const favoriteGenres = userGenres.map((ug) => ug.Genre.name);

      // Get ALL anime IDs and titles only (for the prompt)
      const allAnimes = await Anime.findAll({
        attributes: ["id", "title"],
        raw: true,
      });

      // Create ID list for Gemini
      const animeListForPrompt = allAnimes.map((anime) => ({
        id: anime.id,
        title: anime.title,
      }));

      const prompt = `You are a recommendation system. A user likes these anime genres: [${favoriteGenres.join(
        ", "
      )}]

From the following anime list, select EXACTLY 6 anime IDs that best match the user's genre preferences. Prioritize anime that have at least one of the user's favorite genres.

Anime List:
${JSON.stringify(animeListForPrompt, null, 2)}

IMPORTANT RULES:
1. Return ONLY an array of 6 numeric IDs
2. Include anime ID 228 as one of the 6 recommendations
3. The other 5 should strongly match the user's genre preferences
4. Return format must be: [id1, id2, id3, id4, id5, id6]

Return only the array of IDs, nothing else.`;

      try {
        const content = await generateContent(prompt);
        console.log("Gemini raw response:", content);

        // Since responseSchema is set to return JSON array, content should already be a JSON string
        let recommendedIds;

        // Try to parse the response
        try {
          recommendedIds = JSON.parse(content);
          console.log("Parsed IDs:", recommendedIds);
        } catch (parseError) {
          console.error("JSON Parse error:", parseError);
          console.log("Raw content that failed to parse:", content);
          throw parseError;
        }

        // Validate that we got an array of numbers
        if (!Array.isArray(recommendedIds) || recommendedIds.length === 0) {
          throw new Error("Invalid response format from Gemini");
        }

        // Ensure all IDs are valid numbers
        recommendedIds = recommendedIds.filter(
          (id) => typeof id === "number" && !isNaN(id)
        );

        // Now fetch FULL anime data for the recommended IDs
        const recommendedAnimes = await Anime.findAll({
          where: {
            id: recommendedIds,
          },
          // This will get ALL fields needed for your cards!
        });

        return res.status(200).json({
          recommendations: recommendedAnimes,
          basedOnGenres: favoriteGenres,
          method: "gemini",
        });
      } catch (error) {
        console.error("Gemini processing error:", error);
        // Final fallback: just random animes
        const randomAnimes = await Anime.findAll({
          order: Sequelize.literal("RANDOM()"),
          limit: 6,
        });

        return res.status(200).json({
          recommendations: randomAnimes,
          basedOnGenres: favoriteGenres,
          method: "fallback-random",
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = animeController;
