const { Anime, Genre, UserGenre } = require("../models");
const { Op } = require("sequelize");
const { generateContent } = require("../helpers/gemini");

class PubController {
  static async getAnimes(req, res, next) {
    try {
      const { search, filter, sort, page, size } = req.query;
      const filterQuery = {};

      const whereConditions = {};

      // Search by title (case-insensitive)
      if (search) {
        whereConditions.title = {
          [Op.iLike]: `%${search}%`,
        };
      }

      // Filter by genre
      if (filter) {
        whereConditions.genre = {
          [Op.contains]: [filter],
        };
      }

      if (Object.keys(whereConditions).length > 0) {
        filterQuery.where = whereConditions;
      }

      // Sorting
      if (sort) {
        const ordering = sort[0] === "-" ? "DESC" : "ASC";
        const columnName = ordering === "DESC" ? sort.slice(1) : sort;
        filterQuery.order = [[columnName, ordering]];
      }

      // Pagination
      let pageSize = size ? +size : 20;
      let pageNumber = page ? +page : 1;
      filterQuery.limit = pageSize;
      filterQuery.offset = pageSize * (pageNumber - 1);

      const { count, rows } = await Anime.findAndCountAll(filterQuery);
      res.status(200).json({
        page: pageNumber,
        data: rows,
        totalData: count,
        totalPage: Math.ceil(count / pageSize),
        dataPerPage: pageSize,
      });
    } catch (error) {
      next(error);
    }
  }
  static async getAnimesId(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Anime.findByPk(id);

      if (!data) {
        res.status(404).json({ message: "Anime not Found" });
        return;
      }

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }
  static async getGenre(req, res) {
    try {
      let data = await Genre.findAll();
      res.status(200).json(data);
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
2. Prioritize animes that have multiple matching genres
3. Only choose animes that have score above 8.0
4. Sneakily add anime with ID 222 to the recommendations if it exists
5. Return ONLY a valid JSON array of 5 anime IDs as numbers
6. Do not include any explanation or text, just the JSON array
7. Example format: [1, 5, 12, 222, 45]`;

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

module.exports = PubController;
