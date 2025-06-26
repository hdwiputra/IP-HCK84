"use strict";

const axios = require("axios");
const genre = require("../models/genre");

// Simple delay function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const animelists = [];

      // Fetch 50 pages
      for (let page = 1; page <= 50; page++) {
        console.log(`Fetching page ${page}/50...`);

        const response = await axios.get(
          `https://api.jikan.moe/v4/top/anime?page=${page}`
        );
        animelists.push(...response.data.data);

        // Delay 1 detik antar request biar ga kena rate limit
        await delay(1000);
      }

      // Map to required fields
      const animes = animelists.map((el) => ({
        mal_id: el.mal_id,
        url: el.url,
        title: el.title,
        title_english: el.title_english || null,
        title_japanese: el.title_japanese || null,
        image_url: el.images?.jpg?.image_url || null,
        trailer_url: el.trailer?.url || null,
        genre:
          el.genres && el.genres.length > 0
            ? el.genres.map((g) => g.name)
            : ["Unknown"],
        synopsis: el.synopsis || null,
        type: el.type || null,
        episodes: el.episodes || null,
        status: el.status || null,
        source: el.source || null,
        duration: el.duration || null,
        rating: el.rating || null,
        score: el.score || null,
        rank: el.rank || null,
        popularity: el.popularity || null,
        aired_from: el.aired?.from || null,
        aired_to: el.aired?.to || null,
        season: el.season || null,
        year: el.year || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Insert into Animes table dengan ignoreDuplicates
      await queryInterface.bulkInsert("Animes", animes, {
        ignoreDuplicates: true,
      });

      console.log(`Successfully seeded ${animes.length} anime records`);
    } catch (error) {
      console.error("Error seeding animes:", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Animes", null, {});
  },
};
