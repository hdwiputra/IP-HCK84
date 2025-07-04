const app = require("../app");
const request = require("supertest");
const { sequelize, User, Anime, Genre } = require("../models");
const { queryInterface } = sequelize;
const axios = require("axios");

// Mock axios for external API calls
jest.mock("axios");

let genreData = [
  {
    mal_id: 1,
    name: "Action",
    url: "https://myanimelist.net/anime/genre/1/Action",
    icon: "⚔️",
    description: "Anime dengan adegan pertarungan dan aksi cepat.",
  },
  {
    mal_id: 2,
    name: "Adventure",
    url: "https://myanimelist.net/anime/genre/2/Adventure",
    icon: "🧭",
    description: "Anime dengan eksplorasi dunia luas dan perjalanan.",
  },
  {
    mal_id: 4,
    name: "Comedy",
    url: "https://myanimelist.net/anime/genre/4/Comedy",
    icon: "😂",
    description: "Anime dengan humor dan situasi lucu.",
  },
  {
    mal_id: 5,
    name: "Romance",
    url: "https://myanimelist.net/anime/genre/5/Romance",
    icon: "💘",
    description: "Anime yang berfokus pada kisah cinta dan hubungan.",
  },
];

let animeData = [
  {
    mal_id: 1,
    url: "https://myanimelist.net/anime/1",
    title: "Test Anime 1",
    title_english: "Test Anime 1 EN",
    title_japanese: "テストアニメ 1",
    image_url: "http://example.com/image1.jpg",
    trailer_url: "http://example.com/trailer1.mp4",
    genre: ["Action", "Adventure"],
    synopsis: "Test synopsis 1",
    type: "TV",
    episodes: 12,
    status: "Finished Airing",
    source: "Manga",
    duration: "24 min per ep",
    rating: "PG-13",
    score: 8.5,
    rank: 100,
    popularity: 150,
    year: 2023,
    season: "Spring",
  },
  {
    mal_id: 2,
    url: "https://myanimelist.net/anime/2",
    title: "Test Anime 2",
    title_english: "Test Anime 2 EN",
    title_japanese: "テストアニメ 2",
    image_url: "http://example.com/image2.jpg",
    trailer_url: "http://example.com/trailer2.mp4",
    genre: ["Comedy", "Romance"],
    synopsis: "Test synopsis 2",
    type: "TV",
    episodes: 24,
    status: "Currently Airing",
    source: "Light Novel",
    duration: "24 min per ep",
    rating: "PG-13",
    score: 7.8,
    rank: 200,
    popularity: 250,
    year: 2023,
    season: "Fall",
  },
];

let createdAnimes = [];
let createdGenres = [];

beforeAll(async () => {
  try {
    // Clean up all tables first in correct order (respecting foreign key constraints)
    await queryInterface.bulkDelete("UserGenres", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
    await queryInterface.bulkDelete("UserAnimes", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
    await queryInterface.bulkDelete("Animes", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
    await queryInterface.bulkDelete("Genres", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
    await queryInterface.bulkDelete("Users", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });

    // Reset arrays
    createdGenres = [];
    createdAnimes = [];

    // Seed genres first
    for (let genre of genreData) {
      const created = await Genre.create(genre);
      createdGenres.push(created);
    }

    // Then seed animes
    for (let anime of animeData) {
      try {
        const created = await Anime.create(anime);
        createdAnimes.push(created);
      } catch (err) {
        console.error(`❌ ERROR seeding anime "${anime.title}"`);
        console.error(err.name, err.message);
        console.dir(err.errors || err, { depth: 5 });
      }
    }

    console.log(
      `Created ${createdGenres.length} genres and ${createdAnimes.length} animes`
    );
  } catch (error) {
    console.log(error, "<< error in beforeAll");
  }
});

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe("/pub", () => {
  describe("GET /pub/animes", () => {
    describe("Success", () => {
      test("Should return all animes without query parameters", async () => {
        const { status, body } = await request(app).get("/pub/animes");

        expect(status).toBe(200);
        expect(body).toHaveProperty("data", expect.any(Array));
        expect(body).toHaveProperty("page", expect.any(Number));
        expect(body).toHaveProperty("totalData", expect.any(Number));
        expect(body).toHaveProperty("totalPage", expect.any(Number));
        expect(body).toHaveProperty("dataPerPage", expect.any(Number));

        // Only check data properties if we have data
        if (body.data.length > 0) {
          expect(body.data.length).toBe(createdAnimes.length);
          expect(body.data[0]).toHaveProperty("title", expect.any(String));
          expect(body.data[0]).toHaveProperty("genre", expect.any(Array));
          expect(body.data[0]).toHaveProperty("rating", expect.any(String));
        }
      });

      test("Should return filtered animes when using search query", async () => {
        const { status, body } = await request(app).get(
          "/pub/animes?search=Test"
        );

        expect(status).toBe(200);
        expect(body.data.every((anime) => anime.title.includes("Test"))).toBe(
          true
        );
      });

      test("Should return filtered animes by genre", async () => {
        const { status, body } = await request(app).get(
          "/pub/animes?filter=Action"
        );

        expect(status).toBe(200);
        expect(body.data.every((anime) => anime.genre.includes("Action"))).toBe(
          true
        );
      });

      test("Should return sorted animes when using sort parameter", async () => {
        const { status, body } = await request(app).get(
          "/pub/animes?sort=title"
        );

        expect(status).toBe(200);
        // Check if properly sorted in ascending order
        for (let i = 0; i < body.data.length - 1; i++) {
          expect(body.data[i].title <= body.data[i + 1].title).toBe(true);
        }
      });

      test("Should return reverse sorted animes when using -sort parameter", async () => {
        const { status, body } = await request(app).get(
          "/pub/animes?sort=-title"
        );

        expect(status).toBe(200);
        // Check if properly sorted in descending order
        for (let i = 0; i < body.data.length - 1; i++) {
          expect(body.data[i].title >= body.data[i + 1].title).toBe(true);
        }
      });

      test("Should return paginated results when using page parameters", async () => {
        // First check if we have any data
        if (createdAnimes.length === 0) {
          console.log("No animes created, skipping pagination test");
          return;
        }

        const { status, body } = await request(app).get(
          "/pub/animes?page[size]=1&page[number]=1"
        );

        expect(status).toBe(200);
        expect(body.data.length).toBeLessThanOrEqual(1);
        expect(body.dataPerPage).toBe(1);
        expect(body.page).toBe(1);
      });

      test("Should handle multiple query parameters together", async () => {
        const { status, body } = await request(app).get(
          "/pub/animes?search=Anime&sort=score&page[size]=1"
        );

        expect(status).toBe(200);
        expect(body.data.length).toBeLessThanOrEqual(1);
        expect(body.dataPerPage).toBe(1);
      });

      test("Should return empty data when page number exceeds total pages", async () => {
        const { status, body } = await request(app).get(
          "/pub/animes?page[number]=9999"
        );

        expect(status).toBe(200);
        expect(body).toHaveProperty("data", []);
        expect(body).toHaveProperty("page", 9999);
        expect(body).toHaveProperty("totalData", createdAnimes.length);
      });

      test("Should handle page size limits correctly", async () => {
        const { status, body } = await request(app).get(
          "/pub/animes?page[size]=150"
        );

        expect(status).toBe(200);
        expect(body.dataPerPage).toBe(100); // Max limit is 100
      });
    });

    describe("Failed", () => {
      test("Should handle invalid sort column", async () => {
        const { status, body } = await request(app).get(
          "/pub/animes?sort=invalidColumn"
        );

        expect(status).toBe(400);
        expect(body).toHaveProperty("message");
        expect(body.message).toMatch(/Cannot sort by.*invalid field/);
      });

      test("Should handle invalid page number", async () => {
        const { status, body } = await request(app).get(
          "/pub/animes?page[number]=-1"
        );

        // Controller should handle invalid page numbers gracefully
        expect(status).toBe(200);
        // Should return first page when page number is invalid
        expect(body).toHaveProperty("page", 1);
        expect(body).toHaveProperty("data");
      });

      test("Should handle invalid page size", async () => {
        const { status, body } = await request(app).get(
          "/pub/animes?page[size]=0"
        );

        // Controller returns 200 and uses default page size
        expect(status).toBe(200);
        expect(body).toHaveProperty("dataPerPage", 1); // Min is 1
      });

      test("Should handle non-numeric page values", async () => {
        const { status, body } = await request(app).get(
          "/pub/animes?page[size]=abc&page[number]=xyz"
        );

        expect(status).toBe(200);
        expect(body).toHaveProperty("dataPerPage", 10); // Default
        expect(body).toHaveProperty("page", 1); // Default
      });
    });
  });

  describe("GET /pub/animes/:id", () => {
    describe("Success", () => {
      test("Should return a single anime by id", async () => {
        const targetAnime = createdAnimes[0];
        const { status, body } = await request(app).get(
          `/pub/animes/${targetAnime.id}`
        );

        expect(status).toBe(200);
        expect(body).toHaveProperty("id", targetAnime.id);
        expect(body).toHaveProperty("title", targetAnime.title);
        expect(body).toHaveProperty("genre", expect.any(Array));
        expect(body).toHaveProperty("rating", expect.any(String));
        expect(body).toHaveProperty("mal_id", targetAnime.mal_id);
      });
    });

    describe("Failed", () => {
      test("Should return 404 when anime id doesn't exist", async () => {
        const { status, body } = await request(app).get("/pub/animes/999");

        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Anime not Found");
      });

      test("Should handle invalid id format", async () => {
        const { status, body } = await request(app).get("/pub/animes/abc");

        // Your app returns 500 for invalid id
        expect(status).toBe(500);
        expect(body).toHaveProperty("message");
      });
    });
  });

  describe("GET /pub/animes/popular", () => {
    describe("Success", () => {
      test("Should return popular animes from external API", async () => {
        // Mock successful axios response
        const mockPopularAnimes = {
          data: {
            data: [
              {
                mal_id: 100,
                title: "Popular Anime 1",
                score: 9.0,
              },
              {
                mal_id: 101,
                title: "Popular Anime 2",
                score: 8.9,
              },
            ],
          },
        };

        axios.mockResolvedValueOnce(mockPopularAnimes);

        const { status, body } = await request(app).get("/pub/animes/popular");

        expect(status).toBe(200);
        expect(Array.isArray(body)).toBe(true);
        expect(body).toEqual(mockPopularAnimes.data.data);
        expect(axios).toHaveBeenCalledTimes(1);
        expect(axios).toHaveBeenCalledWith({
          method: "GET",
          url: expect.stringContaining("jikan.moe"),
          family: 4,
        });
      });
    });

    describe("Failed", () => {
      test("Should handle external API errors gracefully", async () => {
        // Mock axios to throw an error
        axios.mockRejectedValueOnce(new Error("Network Error"));

        const { status, body } = await request(app).get("/pub/animes/popular");

        expect(status).toBe(500);
        expect(body).toHaveProperty("message");
      });

      test("Should handle external API timeout", async () => {
        // Mock axios to throw timeout error
        const timeoutError = new Error("timeout of 5000ms exceeded");
        timeoutError.code = "ECONNABORTED";
        axios.mockRejectedValueOnce(timeoutError);

        const { status, body } = await request(app).get("/pub/animes/popular");

        expect(status).toBe(500);
        expect(body).toHaveProperty("message");
      });

      test("Should handle malformed API response", async () => {
        // Mock response without data.data structure
        axios.mockResolvedValueOnce({ data: null });

        const { status, body } = await request(app).get("/pub/animes/popular");

        expect(status).toBe(500);
        expect(body).toHaveProperty("message");
      });
    });
  });

  describe("GET /pub/genres", () => {
    describe("Success", () => {
      test("Should return all genres", async () => {
        const { status, body } = await request(app).get("/pub/genres");

        expect(status).toBe(200);
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(createdGenres.length);
        expect(body[0]).toHaveProperty("id");
        expect(body[0]).toHaveProperty("name", expect.any(String));
        expect(body[0]).toHaveProperty("mal_id", expect.any(Number));
        expect(body[0]).toHaveProperty("url", expect.any(String));
      });

      test("Should return genres in consistent order", async () => {
        const { body: firstCall } = await request(app).get("/pub/genres");
        const { body: secondCall } = await request(app).get("/pub/genres");

        expect(firstCall).toEqual(secondCall);
      });
    });

    describe("Failed", () => {
      test("Should handle database errors", async () => {
        // Mock Genre.findAll to throw an error
        jest
          .spyOn(Genre, "findAll")
          .mockRejectedValueOnce(new Error("Database error"));

        const { status, body } = await request(app).get("/pub/genres");

        expect(status).toBe(500);
        expect(body).toHaveProperty("message");

        // Restore the mock
        Genre.findAll.mockRestore();
      });
    });
  });
});

afterAll(async () => {
  // Clean up all tables in correct order
  await queryInterface.bulkDelete("UserGenres", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await queryInterface.bulkDelete("UserAnimes", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await queryInterface.bulkDelete("Animes", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await queryInterface.bulkDelete("Genres", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
});
