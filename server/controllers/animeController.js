const express = require("express");
const { User, UserAnime, Anime, UserGenre, Genre } = require("../models");
const { generateContent } = require("../helpers/gemini");

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

  // Optimized getRecommendations method
  static async getRecommendations(req, res, next) {
    try {
      const startTime = Date.now();
      const userId = req.user.id;

      // Get user's favorite genres
      const userGenres = await UserGenre.findAll({
        where: { UserId: userId },
        include: [{ model: Genre, attributes: ["name"] }], // Only get name
        attributes: ["GenreId"], // Minimize data transfer
      });

      if (userGenres.length === 0) {
        return res.status(400).json({
          message: "User has no favorite genres set",
        });
      }

      const favoriteGenres = userGenres.map((ug) => ug.Genre.name);
      console.log("User's favorite genres:", favoriteGenres);

      // OPTIMIZATION 1: Pre-filter animes by genre in database
      const { Op } = require("sequelize");

      // Build genre matching conditions
      const genreConditions = favoriteGenres.map((genre) => ({
        genre: {
          [Op.iLike]: `%${genre}%`,
        },
      }));

      // Get a LIMITED set of relevant animes (not ALL)
      const relevantAnimes = await Anime.findAll({
        where: {
          [Op.and]: [{ id: { [Op.gt]: 25 } }, { [Op.or]: genreConditions }],
        },
        attributes: ["id", "title", "genre", "score"], // Only needed fields
        order: [["score", "DESC"]], // Pre-sort by score
        limit: 50, // Only get top 50 matches, not all animes!
      });

      console.log(
        `Found ${relevantAnimes.length} relevant animes (filtered from database)`
      );

      // If not enough genre matches, get some popular ones too
      let animePool = [...relevantAnimes];
      if (animePool.length < 20) {
        const popularAnimes = await Anime.findAll({
          where: {
            id: {
              [Op.and]: [
                { [Op.gt]: 25 },
                { [Op.notIn]: animePool.map((a) => a.id) }, // Exclude already selected
              ],
            },
          },
          attributes: ["id", "title", "genre", "score"],
          order: [["popularity", "ASC"]], // Lower number = more popular
          limit: 30,
        });
        animePool = [...animePool, ...popularAnimes];
      }

      // Always try to include anime 222 if it exists
      if (!animePool.find((a) => a.id === 222)) {
        const anime222 = await Anime.findByPk(222, {
          attributes: ["id", "title", "genre", "score"],
        });
        if (anime222) animePool.push(anime222);
      }

      console.log(`Total anime pool size: ${animePool.length}`);

      // OPTIMIZATION 2: Use simpler prompt with just IDs and genres
      const animeList = animePool.map((a) => `${a.id}:${a.genre}`).join("\n");

      const prompt = `Select 6 anime IDs that best match these genres: ${favoriteGenres.join(
        ", "
      )}

Animes (format id:genres):
${animeList}

Rules:
- Return ONLY a JSON array of 6 numbers
- Include ID 222 if present
- Vary selections each time
- Example: [26,47,89,123,178,222]`;

      console.log(
        `Prompt size: ${prompt.length} characters (was: ${
          JSON.stringify(animePool).length
        })`
      );

      try {
        // Try AI recommendation
        console.log("Calling Gemini API...");
        const aiStartTime = Date.now();
        const content = await generateContent(prompt);
        console.log(`Gemini responded in ${Date.now() - aiStartTime}ms`);

        // Parse response more efficiently
        let recommendedIds = [];
        const numbers = content.match(/\d+/g);
        if (numbers) {
          recommendedIds = numbers
            .map(Number)
            .filter(
              (id) => animePool.find((a) => a.id === id) // Validate IDs exist in our pool
            )
            .slice(0, 6);
        }

        if (recommendedIds.length === 6) {
          // Get full anime data for recommendations
          const recommendedAnimes = await Anime.findAll({
            where: { id: recommendedIds },
          });

          console.log(`Total execution time: ${Date.now() - startTime}ms`);

          return res.status(200).json({
            recommendations: recommendedAnimes,
            basedOnGenres: favoriteGenres,
            count: recommendedAnimes.length,
            method: "ai-powered-optimized",
            executionTime: `${Date.now() - startTime}ms`,
          });
        }
      } catch (geminiError) {
        console.error("Gemini error:", geminiError.message);
      }

      // FALLBACK: Fast random selection from pre-filtered pool
      console.log("Using optimized fallback...");

      // Shuffle and take 6
      const shuffled = animePool.sort(() => 0.5 - Math.random());
      let selectedIds = shuffled.slice(0, 6).map((a) => a.id);

      // Ensure anime 222 is included if it exists
      if (animePool.find((a) => a.id === 222) && !selectedIds.includes(222)) {
        selectedIds[5] = 222;
      }

      const recommendedAnimes = await Anime.findAll({
        where: { id: selectedIds },
      });

      console.log(`Total execution time: ${Date.now() - startTime}ms`);

      res.status(200).json({
        recommendations: recommendedAnimes,
        basedOnGenres: favoriteGenres,
        count: recommendedAnimes.length,
        method: "optimized-fallback",
        executionTime: `${Date.now() - startTime}ms`,
      });
    } catch (error) {
      console.error("Recommendation error:", error);
      next(error);
    }
  }
}

module.exports = animeController;
