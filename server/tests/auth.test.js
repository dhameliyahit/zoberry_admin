const authController = require("../src/controllers/auth.controller");
const User = require("../src/models/User");
const axios = require("axios");

jest.mock("../src/models/User");
jest.mock("axios");
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("jwt_mock_token_123"),
}));

describe("Auth Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("Register", () => {
    test("should register a user and return token + data", async () => {
      req.body = {
        name: "Alice",
        email: "alice@example.com",
        password: "password123",
        phone: "9876543210",
      };

      const mockCreatedUser = {
        _id: "user_alice",
        name: "Alice",
        email: "alice@example.com",
        role: "customer",
        image: "",
      };

      User.create.mockResolvedValue(mockCreatedUser);

      await authController.register(req, res, next);

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Alice", email: "alice@example.com" })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            _id: "user_alice",
            token: "jwt_mock_token_123",
          }),
        })
      );
    });
  });

  describe("Login", () => {
    test("should return 401 if user credentials do not match", async () => {
      req.body = { email: "alice@example.com", password: "wrong" };
      const mockSelect = {
        select: jest.fn().mockResolvedValue({
          email: "alice@example.com",
          matchPassword: jest.fn().mockResolvedValue(false),
        }),
      };
      User.findOne.mockReturnValue(mockSelect);

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Invalid credentials" })
      );
    });

    test("should login successfully if credentials are correct", async () => {
      req.body = { email: "alice@example.com", password: "password123" };
      const mockUser = {
        _id: "user_alice",
        name: "Alice",
        email: "alice@example.com",
        role: "customer",
        image: "https://example.com/alice.jpg",
        matchPassword: jest.fn().mockResolvedValue(true),
      };
      const mockSelect = {
        select: jest.fn().mockResolvedValue(mockUser),
      };
      User.findOne.mockReturnValue(mockSelect);

      await authController.login(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            _id: "user_alice",
            image: "https://example.com/alice.jpg",
            token: "jwt_mock_token_123",
          }),
        })
      );
    });
  });

  describe("Google Login", () => {
    test("should verify Google token and create new user with profile image if not exists", async () => {
      req.body = { token: "google_id_token" };
      const mockGooglePayload = {
        email: "google@example.com",
        name: "Google User",
        picture: "https://google.com/pic.jpg",
      };
      axios.get.mockResolvedValue({ data: mockGooglePayload });
      User.findOne.mockResolvedValue(null); // doesn't exist yet

      const mockCreatedUser = {
        _id: "user_google_123",
        name: "Google User",
        email: "google@example.com",
        role: "customer",
        image: "https://google.com/pic.jpg",
      };
      User.create.mockResolvedValue(mockCreatedUser);

      await authController.googleLogin(req, res, next);

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("google_id_token")
      );
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Google User",
          email: "google@example.com",
          image: "https://google.com/pic.jpg",
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            _id: "user_google_123",
            image: "https://google.com/pic.jpg",
            token: "jwt_mock_token_123",
          }),
        })
      );
    });

    test("should log in existing user and update profile picture if missing", async () => {
      req.body = { token: "google_id_token" };
      const mockGooglePayload = {
        email: "google@example.com",
        name: "Google User",
        picture: "https://google.com/pic.jpg",
      };
      axios.get.mockResolvedValue({ data: mockGooglePayload });

      const mockUser = {
        _id: "user_google_123",
        name: "Google User",
        email: "google@example.com",
        role: "customer",
        image: "",
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);

      await authController.googleLogin(req, res, next);

      expect(mockUser.image).toBe("https://google.com/pic.jpg");
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            _id: "user_google_123",
            image: "https://google.com/pic.jpg",
          }),
        })
      );
    });
  });

  describe("GetMe", () => {
    test("should fetch logged in user details", async () => {
      req.user = { _id: "user_123", name: "John Doe", email: "john@example.com" };

      await authController.getMe(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: req.user })
      );
    });
  });
});
