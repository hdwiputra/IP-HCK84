const { Anime, Genre } = require("../models");
const { Op } = require("sequelize");
const axios = require("axios");
// https://api.jikan.moe/v4/anime?status=airing&order_by=popularity
class PubController {
  static async getAnimes(req, res, next) {
    try {
      const { search, filter, sort, page } = req.query;
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

        // Check if columnName is a valid field in Anime model
        if (!Anime.rawAttributes[columnName]) {
          throw {
            name: "InvalidSort",
            message: `Cannot sort by '${columnName}' - invalid field`,
          };
        }

        filterQuery.order = [[columnName, ordering]];
      }

      // Pagination with validation
      let pageSize = 10; // default page size
      let pageNumber = 1; // default page number

      if (page) {
        if (page.size) {
          // Ensure pageSize is at least 1 and max 100 (to prevent abuse)
          pageSize = Math.max(1, Math.min(100, parseInt(page.size) || 10));
          filterQuery.limit = pageSize;
        }

        if (page.number) {
          // Ensure pageNumber is at least 1
          pageNumber = Math.max(1, parseInt(page.number) || 1);
          filterQuery.offset = pageSize * (pageNumber - 1);
        }
      }

      const { count, rows } = await Anime.findAndCountAll(filterQuery);

      // Calculate total pages
      const totalPages = Math.ceil(count / pageSize);

      // If page number exceeds total pages, you have two options:
      // Option 1: Return empty data
      if (pageNumber > totalPages && totalPages > 0) {
        return res.status(200).json({
          page: pageNumber,
          data: [],
          totalData: count,
          totalPage: totalPages,
          dataPerPage: pageSize,
        });
      }

      // Option 2: Or just return the data (which will be empty naturally)
      res.status(200).json({
        page: pageNumber,
        data: rows,
        totalData: count,
        totalPage: totalPages,
        dataPerPage: pageSize,
      });
    } catch (error) {
      if (error.name === "InvalidSort") {
        res.status(400).json({ message: error.message });
        return;
      }
      next(error);
    }
  }
  static async getPopularAnimes(req, res, next) {
    try {
      const response = await axios({
        method: "GET",
        url: "https://api.jikan.moe/v4/anime?status=airing&order_by=popularity&start_date=2025-01-01&limit=24",
        family: 4, // Use IPv4
      });
      const data = response.data.data;
      res.status(200).json(data);
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
}

module.exports = PubController;
