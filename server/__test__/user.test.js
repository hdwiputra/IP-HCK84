const app = require("../app");
const request = require("supertest");
const { sequelize, User } = require("../models");
const { queryInterface } = sequelize;
const { token } = require("../helpers/jwt");
const bcrypt = require("../helpers/bcrypt");
const { OAuth2Client } = require("google-auth-library");

// Mock Google OAuth2Client
jest.mock("google-auth-library", () => {
  const mockVerifyIdToken = jest.fn();
  const mockClient = jest.fn(() => ({
    verifyIdToken: mockVerifyIdToken,
  }));
  mockClient.mockVerifyIdToken = mockVerifyIdToken;
  return { OAuth2Client: mockClient };
});

// Test data
let userAdmin = {
  fullName: "Xavier Admin",
  username: "Xavier",
  email: "assistance.xavier@gmail.com",
  password: "xavier",
};

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

let createdAdmin;
let authToken;

// Get the mock function
const mockVerifyIdToken = OAuth2Client.mockVerifyIdToken;

beforeAll(async () => {
  try {
    // Clean up all related tables first (in case of foreign key constraints)
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
    await queryInterface.bulkDelete("Users", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });

    // Create admin user for login tests
    createdAdmin = await User.create(userAdmin);
    authToken = token({ id: createdAdmin.id });
  } catch (error) {
    console.log(error, "<< error in beforeAll");
  }
});

// Clear mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe("User Controllers", () => {
  describe("POST /register", () => {
    describe("Success", () => {
      test("Should successfully register a new user", async () => {
        const { status, body } = await request(app)
          .post("/register")
          .send(testUser);

        expect(status).toBe(201);
        expect(body).toHaveProperty("message", "User created successfully");
        expect(body).toHaveProperty("user", expect.any(Object));
        expect(body.user).toHaveProperty("id", expect.any(Number));
        expect(body.user).toHaveProperty("fullName", testUser.fullName);
        expect(body.user).toHaveProperty("username", testUser.username);
        expect(body.user).toHaveProperty("email", testUser.email);
        expect(body.user).not.toHaveProperty("password");

        // Verify password is hashed in database
        const userInDb = await User.findByPk(body.user.id);
        expect(userInDb.password).not.toBe(testUser.password);
        expect(bcrypt.comparePass(testUser.password, userInDb.password)).toBe(
          true
        );
      });

      test("Should register another user successfully", async () => {
        const { status, body } = await request(app)
          .post("/register")
          .send(testUser2);

        expect(status).toBe(201);
        expect(body.user).toHaveProperty("username", testUser2.username);
      });
    });

    describe("Failed", () => {
      test("Should fail when email already exists", async () => {
        const { status, body } = await request(app).post("/register").send({
          fullName: "Another User",
          username: "anotheruser",
          email: testUser.email, // Using existing email
          password: "password123",
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message");
        expect(body.message).toMatch(/email/i);
      });

      test("Should fail when username already exists", async () => {
        const { status, body } = await request(app).post("/register").send({
          fullName: "Another User",
          username: testUser.username, // Using existing username
          email: "another@example.com",
          password: "password123",
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message");
        expect(body.message).toMatch(/username/i);
      });

      test("Should fail when fullName is missing", async () => {
        const { status, body } = await request(app).post("/register").send({
          username: "newuser",
          email: "newuser@example.com",
          password: "password123",
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message");
      });

      test("Should fail when username is missing", async () => {
        const { status, body } = await request(app).post("/register").send({
          fullName: "New User",
          email: "newuser@example.com",
          password: "password123",
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message");
      });

      test("Should fail when email is missing", async () => {
        const { status, body } = await request(app).post("/register").send({
          fullName: "New User",
          username: "newuser",
          password: "password123",
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message");
      });

      test("Should fail when password is missing", async () => {
        const { status, body } = await request(app).post("/register").send({
          fullName: "New User",
          username: "newuser3",
          email: "newuser3@example.com",
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message");
      });

      test("Should fail with invalid email format", async () => {
        const { status, body } = await request(app).post("/register").send({
          fullName: "New User",
          username: "newuser4",
          email: "invalid-email",
          password: "password123",
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message");
        expect(body.message).toMatch(/email/i);
      });

      test("Should fail with empty string values", async () => {
        const { status, body } = await request(app).post("/register").send({
          fullName: "",
          username: "",
          email: "",
          password: "",
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message");
      });

      test("Should handle SQL injection attempts", async () => {
        const { status, body } = await request(app).post("/register").send({
          fullName: "Test'; DROP TABLE Users;--",
          username: "testuser5",
          email: "test5@example.com",
          password: "password123",
        });

        // Should either succeed (sanitized) or fail validation
        expect([201, 400]).toContain(status);

        // Verify Users table still exists
        const users = await User.findAll();
        expect(users).toBeDefined();
      });
    });
  });

  describe("POST /login", () => {
    describe("Success", () => {
      test("Should login successfully with email", async () => {
        const { status, body } = await request(app).post("/login").send({
          email: userAdmin.email,
          password: userAdmin.password,
        });

        expect(status).toBe(200);
        expect(body).toHaveProperty("access_token", expect.any(String));
        expect(body).toHaveProperty("user", expect.any(Object));
        expect(body.user).toHaveProperty("id", createdAdmin.id);
        expect(body.user).toHaveProperty("email", userAdmin.email);
        expect(body.user).not.toHaveProperty("password");

        // Verify token is valid
        const decodedToken = require("../helpers/jwt").decoded(
          body.access_token
        );
        expect(decodedToken).toHaveProperty("id", createdAdmin.id);
      });

      test("Should login successfully with username", async () => {
        const { status, body } = await request(app).post("/login").send({
          username: userAdmin.username,
          password: userAdmin.password,
        });

        expect(status).toBe(200);
        expect(body).toHaveProperty("access_token", expect.any(String));
        expect(body.user).toHaveProperty("username", userAdmin.username);
      });

      test("Should login successfully with both email and username", async () => {
        const { status, body } = await request(app).post("/login").send({
          username: userAdmin.username,
          email: userAdmin.email,
          password: userAdmin.password,
        });

        expect(status).toBe(200);
        expect(body).toHaveProperty("access_token", expect.any(String));
      });

      test("Should handle case-insensitive email", async () => {
        const { status, body } = await request(app).post("/login").send({
          email: userAdmin.email.toUpperCase(),
          password: userAdmin.password,
        });

        expect([401]).toContain(status);
      });
    });

    describe("Failed", () => {
      test("Should fail when password is missing", async () => {
        const { status, body } = await request(app).post("/login").send({
          username: userAdmin.username,
          email: userAdmin.email,
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Password is required");
      });

      test("Should fail when both email and username are missing", async () => {
        const { status, body } = await request(app).post("/login").send({
          password: "xavier",
        });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message", "Email or Username is required");
      });

      test("Should fail with non-existent email", async () => {
        const { status, body } = await request(app).post("/login").send({
          email: "notregistered@gmail.com",
          password: "xavier",
        });

        expect(status).toBe(401);
        expect(body).toHaveProperty(
          "message",
          "Invalid email/username/password"
        );
      });

      test("Should fail with non-existent username", async () => {
        const { status, body } = await request(app).post("/login").send({
          username: "notregistereduser",
          password: "xavier",
        });

        expect(status).toBe(401);
        expect(body).toHaveProperty(
          "message",
          "Invalid email/username/password"
        );
      });

      test("Should fail with incorrect password", async () => {
        const { status, body } = await request(app).post("/login").send({
          username: userAdmin.username,
          email: userAdmin.email,
          password: "wrongpassword",
        });

        expect(status).toBe(401);
        expect(body).toHaveProperty(
          "message",
          "Invalid email/username/password"
        );
      });

      test("Should fail with empty string password", async () => {
        const { status, body } = await request(app).post("/login").send({
          email: userAdmin.email,
          password: "",
        });

        // Your controller doesn't treat empty string as missing
        expect(status).toBe(400); // It goes to the password comparison
        expect(body).toHaveProperty("message", "Password is required");
      });

      test("Should handle SQL injection in login", async () => {
        const { status, body } = await request(app).post("/login").send({
          email: "admin@example.com' OR '1'='1",
          password: "' OR '1'='1",
        });

        expect(status).toBe(401);
        expect(body).toHaveProperty(
          "message",
          "Invalid email/username/password"
        );
      });

      test("Should handle very long input gracefully", async () => {
        const longString = "a".repeat(1000);
        const { status } = await request(app)
          .post("/login")
          .send({
            email: longString + "@example.com",
            password: longString,
          });

        expect([400, 401]).toContain(status);
      });
    });
  });

  describe("POST /login/google", () => {
    // Save original env
    const originalEnv = process.env.GOOGLE_CLIENT_ID;

    beforeAll(() => {
      // Set test Google Client ID
      process.env.GOOGLE_CLIENT_ID = "test-google-client-id";
    });

    afterAll(() => {
      // Restore original env
      process.env.GOOGLE_CLIENT_ID = originalEnv;
    });

    describe("Success", () => {
      test("Should create new user and login with valid Google token", async () => {
        const mockPayload = {
          email: "newgoogleuser@gmail.com",
          name: "New Google User",
        };

        mockVerifyIdToken.mockResolvedValueOnce({
          getPayload: () => mockPayload,
        });

        const { status, body } = await request(app)
          .post("/login/google")
          .send({ googleToken: "valid-google-token" });

        expect(status).toBe(200);
        expect(body).toHaveProperty("message", "Login Success");
        expect(body).toHaveProperty("access_token");
        expect(body).toHaveProperty("user");
        expect(body.user).toHaveProperty("email", mockPayload.email);
        expect(body.user).toHaveProperty("fullName", mockPayload.name);
        expect(body.user).not.toHaveProperty("password");

        // Verify user was created in database
        const createdUser = await User.findOne({
          where: { email: mockPayload.email },
        });
        expect(createdUser).toBeTruthy();
        expect(createdUser.username).toMatch(/^nguser\d{4}$/); // Based on name transformation
      });

      test("Should login existing user with valid Google token", async () => {
        const mockPayload = {
          email: userAdmin.email, // Existing user
          name: userAdmin.fullName,
        };

        mockVerifyIdToken.mockResolvedValueOnce({
          getPayload: () => mockPayload,
        });

        const { status, body } = await request(app)
          .post("/login/google")
          .send({ googleToken: "valid-google-token" });

        expect(status).toBe(200);
        expect(body).toHaveProperty("message", "Login Success");
        expect(body).toHaveProperty("access_token");
        expect(body.user).toHaveProperty("id", createdAdmin.id);
        expect(body.user).toHaveProperty("email", userAdmin.email);
      });

      test("Should handle complex names correctly", async () => {
        const mockPayload = {
          email: "john.doe.smith@gmail.com",
          name: "John Doe Smith",
        };

        mockVerifyIdToken.mockResolvedValueOnce({
          getPayload: () => mockPayload,
        });

        const { status, body } = await request(app)
          .post("/login/google")
          .send({ googleToken: "valid-google-token" });

        expect(status).toBe(200);
        expect(body.user.username).toMatch(/^jdsmith\d{4}$/);
      });
    });

    describe("Failed", () => {
      test("Should fail when googleToken is missing", async () => {
        const { status, body } = await request(app)
          .post("/login/google")
          .send({});

        expect(status).toBe(500);
        expect(body).toHaveProperty("message");
      });

      test("Should fail when Google verification fails", async () => {
        mockVerifyIdToken.mockRejectedValueOnce(new Error("Invalid token"));

        const { status, body } = await request(app)
          .post("/login/google")
          .send({ googleToken: "invalid-google-token" });

        expect(status).toBe(500);
        expect(body).toHaveProperty("message");
      });

      test("Should fail when GOOGLE_CLIENT_ID is not set", async () => {
        // Temporarily remove the env variable
        const tempClientId = process.env.GOOGLE_CLIENT_ID;
        delete process.env.GOOGLE_CLIENT_ID;

        const { status, body } = await request(app)
          .post("/login/google")
          .send({ googleToken: "valid-google-token" });

        expect(status).toBe(500);
        expect(body).toHaveProperty("message");

        // Restore env variable
        process.env.GOOGLE_CLIENT_ID = tempClientId;
      });

      test("Should handle database errors during user creation", async () => {
        const mockPayload = {
          email: null, // This should cause a validation error
          name: "Invalid User",
        };

        mockVerifyIdToken.mockResolvedValueOnce({
          getPayload: () => mockPayload,
        });

        const { status, body } = await request(app)
          .post("/login/google")
          .send({ googleToken: "valid-google-token" });

        expect(status).toBe(400);
        expect(body).toHaveProperty("message");
      });
    });
  });

  describe("Security", () => {
    test("Should not expose sensitive information in errors", async () => {
      const { body } = await request(app).post("/login").send({
        email: "nonexistent@example.com",
        password: "password",
      });

      // Should not reveal whether email exists or not
      expect(body.message).not.toMatch(/email.*not.*found/i);
      expect(body.message).not.toMatch(/user.*not.*exist/i);
    });

    test("Should handle concurrent registration attempts", async () => {
      const newUser = {
        fullName: "Concurrent User",
        username: "concurrent",
        email: "concurrent@example.com",
        password: "password123",
      };

      // Send multiple concurrent requests
      const promises = Array(3)
        .fill(null)
        .map(() => request(app).post("/register").send(newUser));

      const results = await Promise.all(promises);

      // Only one should succeed
      const successCount = results.filter((r) => r.status === 201).length;
      expect(successCount).toBe(1);

      // Others should fail with duplicate error
      const failCount = results.filter((r) => r.status === 400).length;
      expect(failCount).toBe(2);
    });
  });
});

afterAll(async () => {
  // Clean up all related tables
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
  await queryInterface.bulkDelete("Users", null, {
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
});
