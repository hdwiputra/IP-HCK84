const express = require("express");
const { User, UserAnime, Anime, UserGenre, Genre } = require("../models");
const { generateContent } = require("../helpers/gemini");

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

  static async getRecommendations(req, res, next) {
    try {
      const userId = req.user.id;

      // Get user's favorite genres
      const userGenres = await UserGenre.findAll({
        where: { UserId: userId },
        include: [{ model: Genre }],
      });

      if (userGenres.length === 0) {
        return res.status(400).json({
          message: "User has no favorite genres set",
        });
      }

      const favoriteGenres = userGenres.map((ug) => ug.Genre.name);

      // Get all animes
      const animes = await Anime.findAll({
        attributes: ["id", "title", "genre"],
      });

      if (animes.length === 0) {
        return res.status(404).json({
          message: "No animes found in database",
        });
      }

      const animesIdAndTitle = animes.map((anime) => ({
        id: anime.id,
        title: anime.title,
        genre: anime.genre,
      }));

      // Build a clearer prompt
      const prompt = `You are a JSON API. Based on a user's favorite genres: ${favoriteGenres.join(
        ", "
      )}, recommend exactly 5 anime IDs from this list.

Available animes:
${JSON.stringify(animesIdAndTitle, null, 2)}

Instructions:
1. Select 5 animes that best match the user's favorite genres
2. Only choose animes id that is more than 25
3. Sneakily add anime with id 222 to the recommendations if it exists
4. Do varied the anime returned so that they are not the same one every time
5. Return ONLY a valid JSON array of 5 anime id as numbers
6. Do not include any explanation or text, just the JSON array`;

      console.log("Sending prompt to Gemini...");
      const content = await generateContent(prompt);
      console.log("Gemini response:", content);

      // Parse AI response
      let parsedContent;
      try {
        // Try to find JSON array in the response
        const jsonMatch = content.match(/\[[\d,\s]+\]/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[0]);
        } else {
          parsedContent = JSON.parse(content);
        }
      } catch (e) {
        console.error("Failed to parse Gemini response:", e);
        // Fallback: extract numbers from the response
        parsedContent = content.match(/\d+/g)?.map(Number) || [];
      }

      // Validate we got an array of numbers
      if (!Array.isArray(parsedContent) || parsedContent.length === 0) {
        throw new Error("Invalid response from AI");
      }

      // Limit to 5 recommendations
      parsedContent = parsedContent.slice(0, 5);

      // Get full anime objects for the recommended IDs
      const recommendedAnimes = await Anime.findAll({
        where: { id: parsedContent },
      });

      res.status(200).json({
        recommendations: recommendedAnimes,
        basedOnGenres: favoriteGenres,
        count: recommendedAnimes.length,
      });
    } catch (error) {
      console.error("Recommendation error:", error);
      next(error);
    }
  }
}

module.exports = animeController;
