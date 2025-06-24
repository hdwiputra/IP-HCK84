const { Anime, Genre, User } = require("../models");
const { Op } = require("sequelize");

class PubController {
  //   static async getAnimes(req, res, next) {
  //     try {
  //       const { search, filter, sort, page } = req.query;
  //       const filterQuery = {};

  //       const whereConditions = {};

  //       if (search) {
  //         whereConditions.name = {
  //           [Op.iLike]: `%${search}%`,
  //         };
  //       }

  //       if (filter) {
  //         whereConditions.categoryId = filter;
  //       }

  //       if (Object.keys(whereConditions).length > 0) {
  //         filterQuery.where = whereConditions;
  //       }

  //       if (sort) {
  //         const ordering = sort[0] === "-" ? "DESC" : "ASC";
  //         const columnName = ordering === "DESC" ? sort.slice(1) : sort;
  //         filterQuery.order = [[columnName, ordering]];
  //       }

  //       let pageSize = 10;
  //       let pageNumber = 1;
  //       if (page) {
  //         if (page.size) {
  //           pageSize = page.size;
  //           filterQuery.limit = pageSize;
  //         }

  //         if (page.number) {
  //           pageNumber = page.number;
  //           filterQuery.offset = pageSize * (pageNumber - 1);
  //         }
  //       }

  //       const { count, rows } = await Cuisine.findAndCountAll(filterQuery);
  //       res.status(200).json({
  //         page: pageNumber,
  //         data: rows,
  //         totalData: count,
  //         totalPage: Math.ceil(count / pageSize),
  //         dataPerPage: pageSize,
  //       });
  //     } catch (error) {
  //       next(error);
  //     }
  //   }
  static async getAnimes(req, res, next) {
    try {
      const data = await Anime.findAll();
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
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

module.exports = PubController;
