const app = require("../app");
const request = require("supertest");
const {
  sequelize,
  User,
  Anime,
  Genre,
  UserAnime,
  UserGenre,
} = require("../models");
const { queryInterface } = sequelize;
const { token } = require("../helpers/jwt");
const { generateContent } = require("../helpers/gemini");

// Mock the Gemini helper
jest.mock("../helpers/gemini", () => ({
  generateContent: jest.fn(),
}));

// Test data
let genreData = [
  {
    mal_id: 1,
    name: "Action",
    url: "https://myanimelist.net/anime/genre/1/Action",
  },
  {
    mal_id: 2,
    name: "Adventure",
    url: "https://myanimelist.net/anime/genre/2/Adventure",
  },
  {
    mal_id: 4,
    name: "Comedy",
    url: "https://myanimelist.net/anime/genre/4/Comedy",
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
  // Adding more animes for recommendation testing
  {
    mal_id: 222,
    url: "https://myanimelist.net/anime/222",
    title: "Special Anime 222",
    title_english: "Special Anime 222 EN",
    title_japanese: "特別アニメ 222",
    image_url: "http://example.com/image222.jpg",
    trailer_url: "http://example.com/trailer222.mp4",
    genre: ["Action", "Comedy"],
    synopsis: "Special synopsis for testing",
    type: "TV",
    episodes: 12,
    status: "Finished Airing",
    source: "Original",
    duration: "24 min per ep",
    rating: "PG-13",
    score: 9.0,
    rank: 50,
    popularity: 100,
    year: 2023,
    season: "Winter",
  },
  {
    mal_id: 30,
    url: "https://myanimelist.net/anime/30",
    title: "Action Anime",
    title_english: "Action Anime EN",
    title_japanese: "アクションアニメ",
    image_url: "http://example.com/image30.jpg",
    trailer_url: "http://example.com/trailer30.mp4",
    genre: ["Action", "Thriller"],
    synopsis: "Action packed anime",
    type: "Movie",
    episodes: 1,
    status: "Finished Airing",
    source: "Manga",
    duration: "2 hr",
    rating: "R",
    score: 8.7,
    rank: 75,
    popularity: 120,
    year: 2023,
    season: "Summer",
  },
  {
    mal_id: 31,
    url: "https://myanimelist.net/anime/31",
    title: "Comedy Show",
    title_english: "Comedy Show EN",
    title_japanese: "コメディショー",
    image_url: "http://example.com/image31.jpg",
    trailer_url: "http://example.com/trailer31.mp4",
    genre: ["Comedy", "Slice of Life"],
    synopsis: "Funny comedy anime",
    type: "TV",
    episodes: 26,
    status: "Finished Airing",
    source: "Original",
    duration: "24 min per ep",
    rating: "PG",
    score: 7.5,
    rank: 300,
    popularity: 400,
    year: 2022,
    season: "Spring",
  },
];

let testUser = {
  fullName: "Test User",
  username: "testuser",
  email: "test@example.com",
  password: "testpass123",
};

let testUser2 = {
  fullName: "Test User 2",
  username: "testuser2",
  email: "test2@example.com",
  password: "testpass456",
};

let createdUser, createdUser2;
let authToken, authToken2;
let createdAnimes = [];
let createdGenres = [];

beforeAll(async () => {
  try {
    // Clean up all tables first
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

    // Create test users
    createdUser = await User.create(testUser);
    createdUser2 = await User.create(testUser2);
    authToken = token({ id: createdUser.id });
    authToken2 = token({ id: createdUser2.id });

    // Seed genres
    for (let genre of genreData) {
      const created = await Genre.create(genre);
      createdGenres.push(created);
    }

    // Seed animes
    for (let anime of animeData) {
      const created = await Anime.create(anime);
      createdAnimes.push(created);
    }
  } catch (error) {
    console.log(error, "<< error in beforeAll");
  }
});

describe("Anime Controllers", () => {
  describe("POST /animes/:id", () => {
    describe("Success", () => {
      test("Should add anime to user's list", async () => {
        const { status, body } = await request(app)
          .post(`/animes/${createdAnimes[0].id}`)
          .set("Authorization", `Bearer ${authToken}`);

        expect(status).toBe(201);
        expect(body).toHaveProperty("UserId", createdUser.id);
        expect(body).toHaveProperty("AnimeId", createdAnimes[0].id);
        expect(body).not.toHaveProperty("createdAt");
        expect(body).not.toHaveProperty("updatedAt");
      });
    });

    describe("Failed", () => {
      test("Should return 404 when anime doesn't exist", async () => {
        const { status, body } = await request(app)
          .post("/animes/999")
          .set("Authorization", `Bearer ${authToken}`);

        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Anime not found");
      });

      test("Should return 401 when no token provided", async () => {
        const { status, body } = await request(app).post(
          `/animes/${createdAnimes[0].id}`
        );

        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid token");
      });

      test("Should return 401 when invalid token provided", async () => {
        const { status, body } = await request(app)
          .post(`/animes/${createdAnimes[0].id}`)
          .set("Authorization", "Bearer invalidtoken");

        expect(status).toBe(401);
        expect(body).toHaveProperty("message");
      });
    });
  });

  describe("GET /animes", () => {
    beforeAll(async () => {
      // Clean UserAnimes table first to ensure clean state
      await queryInterface.bulkDelete("UserAnimes", null, {
        truncate: true,
        cascade: true,
        restartIdentity: true,
      });

      // Add some animes to user's list
      await UserAnime.create({
        UserId: createdUser.id,
        AnimeId: createdAnimes[0].id,
        watch_status: "In Progress",
        score: 8,
        episodes_watched: 5,
        notes: "Great anime!",
      });
      await UserAnime.create({
        UserId: createdUser.id,
        AnimeId: createdAnimes[1].id,
        watch_status: "Completed",
        score: 9,
        episodes_watched: 24,
        notes: "Finished it!",
      });
    });

    describe("Success", () => {
      test("Should return user's anime list", async () => {
        const { status, body } = await request(app)
          .get("/animes")
          .set("Authorization", `Bearer ${authToken}`);

        expect(status).toBe(200);
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThanOrEqual(2); // At least 2 animes
        expect(body[0]).toHaveProperty("Anime");
        expect(body[0].Anime).toHaveProperty("title");
        expect(body[0]).not.toHaveProperty("createdAt");
        expect(body[0]).not.toHaveProperty("updatedAt");
      });

      test("Should return empty array for user with no animes", async () => {
        const { status, body } = await request(app)
          .get("/animes")
          .set("Authorization", `Bearer ${authToken2}`);

        expect(status).toBe(200);
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(0);
      });
    });

    describe("Failed", () => {
      test("Should return 401 when no token provided", async () => {
        const { status, body } = await request(app).get("/animes");

        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid token");
      });
    });
  });

  describe("PUT /animes/:id", () => {
    let userAnimeId;

    beforeAll(async () => {
      const userAnime = await UserAnime.findOne({
        where: {
          UserId: createdUser.id,
          AnimeId: createdAnimes[0].id,
        },
      });
      userAnimeId = userAnime.id;
    });

    describe("Success", () => {
      test("Should update anime details successfully", async () => {
        const updateData = {
          score: 9,
          episodes_watched: 10,
          notes: "Updated notes",
        };

        const { status, body } = await request(app)
          .put(`/animes/${userAnimeId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(updateData);

        expect(status).toBe(200);
        expect(body).toHaveProperty("message", "Anime has been updated");

        // Verify the update
        const updated = await UserAnime.findByPk(userAnimeId);
        expect(updated.score).toBe(9);
        expect(updated.episodes_watched).toBe(10);
        expect(updated.watch_status).toBe("In Progress");
      });

      test("Should set status to Completed when all episodes watched", async () => {
        const updateData = {
          score: 10,
          episodes_watched: 12, // Total episodes for anime 1
        };

        const { status, body } = await request(app)
          .put(`/animes/${userAnimeId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(updateData);

        expect(status).toBe(200);

        const updated = await UserAnime.findByPk(userAnimeId);
        expect(updated.watch_status).toBe("Completed");
      });
    });

    describe("Failed", () => {
      test("Should return 404 when anime not in user's list", async () => {
        const { status, body } = await request(app)
          .put("/animes/999")
          .set("Authorization", `Bearer ${authToken}`)
          .send({ score: 8, episodes_watched: 5 });

        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Anime not found");
      });

      test("Should return 403 when trying to update another user's anime", async () => {
        const { status, body } = await request(app)
          .put(`/animes/${userAnimeId}`)
          .set("Authorization", `Bearer ${authToken2}`)
          .send({ score: 8, episodes_watched: 5 });

        expect(status).toBe(403);
        expect(body).toHaveProperty("message", "You're not authorized");
      });

      test("Should return 400 when request body is empty", async () => {
        const { status, body } = await request(app)
          .put(`/animes/${userAnimeId}`)
          .set("Authorization", `Bearer ${authToken}`);

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Anime data cannot be empty");
      });

      test("Should return 400 when score is missing", async () => {
        const { status, body } = await request(app)
          .put(`/animes/${userAnimeId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({ episodes_watched: 5 });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Score cannot be empty");
      });

      test("Should return 400 when episodes_watched is missing", async () => {
        const { status, body } = await request(app)
          .put(`/animes/${userAnimeId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({ score: 8 });

        expect(status).toBe(400);
        expect(body).toHaveProperty(
          "message",
          "Episodes watched cannot be empty"
        );
      });

      test("Should return 400 when episodes_watched exceeds total episodes", async () => {
        const { status, body } = await request(app)
          .put(`/animes/${userAnimeId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send({ score: 8, episodes_watched: 15 }); // Anime 1 has only 12 episodes

        expect(status).toBe(400);
        expect(body).toHaveProperty(
          "message",
          "Episodes watched cannot exceed total episodes"
        );
      });
    });
  });

  describe("DELETE /animes/:id", () => {
    let userAnimeId;

    beforeAll(async () => {
      // Create a new UserAnime entry for deletion test
      const userAnime = await UserAnime.create({
        UserId: createdUser.id,
        AnimeId: createdAnimes[2].id,
      });
      userAnimeId = userAnime.id;
    });

    describe("Success", () => {
      test("Should delete anime from user's list", async () => {
        const { status, body } = await request(app)
          .delete(`/animes/${userAnimeId}`)
          .set("Authorization", `Bearer ${authToken}`);

        expect(status).toBe(200);
        expect(body).toHaveProperty("message", "Anime has been deleted");

        // Verify deletion
        const deleted = await UserAnime.findByPk(userAnimeId);
        expect(deleted).toBeNull();
      });
    });

    describe("Failed", () => {
      test("Should return 404 when anime not found", async () => {
        const { status, body } = await request(app)
          .delete("/animes/999")
          .set("Authorization", `Bearer ${authToken}`);

        expect(status).toBe(404);
        expect(body).toHaveProperty("message", "Anime not found");
      });

      test("Should return 403 when trying to delete another user's anime", async () => {
        // Create anime for user 1
        const userAnime = await UserAnime.create({
          UserId: createdUser.id,
          AnimeId: createdAnimes[3].id,
        });

        const { status, body } = await request(app)
          .delete(`/animes/${userAnime.id}`)
          .set("Authorization", `Bearer ${authToken2}`);

        expect(status).toBe(403);
        expect(body).toHaveProperty("message", "You're not authorized");
      });
    });
  });

  describe("POST /animes/genres/:id", () => {
    describe("Success", () => {
      test("Should add genre to user's favorites", async () => {
        const { status, body } = await request(app)
          .post(`/animes/genres/${createdGenres[0].id}`)
          .set("Authorization", `Bearer ${authToken}`);

        expect(status).toBe(201);
        expect(body).toHaveProperty("UserId", createdUser.id);
        expect(body).toHaveProperty("GenreId", createdGenres[0].id);
        expect(body).not.toHaveProperty("createdAt");
        expect(body).not.toHaveProperty("updatedAt");
      });
    });

    describe("Failed", () => {
      test("Should return 401 when no token provided", async () => {
        const { status, body } = await request(app).post(
          `/animes/genres/${createdGenres[0].id}`
        );

        expect(status).toBe(401);
        expect(body).toHaveProperty("message", "Invalid token");
      });
    });
  });

  describe("GET /animes/recommendation", () => {
    beforeAll(async () => {
      // Add favorite genres for user
      await UserGenre.create({
        UserId: createdUser.id,
        GenreId: createdGenres[0].id, // Action
      });
      await UserGenre.create({
        UserId: createdUser.id,
        GenreId: createdGenres[2].id, // Comedy
      });
    });

    describe("Success", () => {
      test("Should return anime recommendations based on user genres", async () => {
        // Mock Gemini response
        generateContent.mockResolvedValueOnce("[30, 31, 222, 1, 2]");

        const { status, body } = await request(app)
          .get("/animes/recommendation")
          .set("Authorization", `Bearer ${authToken}`);

        expect(status).toBe(200);
        expect(body).toHaveProperty("recommendations");
        expect(body).toHaveProperty("basedOnGenres");
        expect(body).toHaveProperty("count");
        expect(Array.isArray(body.recommendations)).toBe(true);
        expect(body.recommendations.length).toBeLessThanOrEqual(5);
        expect(body.basedOnGenres).toContain("Action");
        expect(body.basedOnGenres).toContain("Comedy");
      });

      test("Should handle Gemini response with text around JSON", async () => {
        // Mock Gemini response with extra text
        generateContent.mockResolvedValueOnce(
          "Here are the recommendations: [30, 31, 222] based on your preferences"
        );

        const { status, body } = await request(app)
          .get("/animes/recommendation")
          .set("Authorization", `Bearer ${authToken}`);

        expect(status).toBe(200);
        expect(body.recommendations.length).toBeLessThanOrEqual(5);
      });

      test("Should handle Gemini response with numbers in text format", async () => {
        // Mock Gemini response with numbers in text
        generateContent.mockResolvedValueOnce(
          "The recommendations are: 30, 31, 222, 1, 2"
        );

        const { status, body } = await request(app)
          .get("/animes/recommendation")
          .set("Authorization", `Bearer ${authToken}`);

        expect(status).toBe(200);
        expect(body.recommendations.length).toBeLessThanOrEqual(5);
      });
    });

    describe("Failed", () => {
      test("Should return 400 when user has no favorite genres", async () => {
        const { status, body } = await request(app)
          .get("/animes/recommendation")
          .set("Authorization", `Bearer ${authToken2}`);

        expect(status).toBe(400);
        expect(body).toHaveProperty(
          "message",
          "User has no favorite genres set"
        );
      });

      test("Should handle Gemini API errors", async () => {
        // Mock Gemini error
        generateContent.mockRejectedValueOnce(new Error("Gemini API Error"));

        const { status, body } = await request(app)
          .get("/animes/recommendation")
          .set("Authorization", `Bearer ${authToken}`);

        expect(status).toBe(500);
        expect(body).toHaveProperty("message");
      });

      test("Should handle invalid Gemini response", async () => {
        // Mock invalid response that will cause an error in parsing
        generateContent.mockResolvedValueOnce(
          "invalid response with no numbers"
        );

        const { status, body } = await request(app)
          .get("/animes/recommendation")
          .set("Authorization", `Bearer ${authToken}`);
        console.log(body, "<<<< body in invalid response test");

        // Controller throws error when it can't parse any valid anime IDs
        expect(status).toBe(500);
        expect(body).toHaveProperty("message");
      });
    });
  });
});

afterAll(async () => {
  // Clean up all tables
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
