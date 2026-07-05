const userController = require("../src/controllers/user.controller");
const User = require("../src/models/User");

jest.mock("../src/models/User");

describe("User Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      user: { _id: "user_123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("AddAddress", () => {
    test("should return 400 if phone format is invalid", async () => {
      req.body = { phone: "123", zip: "400001" };

      await userController.addAddress(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Invalid phone number. Must be a valid 10-digit Indian mobile number." })
      );
    });

    test("should return 400 if zip code is invalid", async () => {
      req.body = { phone: "9876543210", zip: "4000" };

      await userController.addAddress(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Invalid zip/pincode. Must be a valid 6-digit Indian pincode." })
      );
    });

    test("should push address and save user if details are valid", async () => {
      req.body = {
        fullName: "Home Address",
        phone: "9876543210",
        street: "Sector 17",
        city: "Mumbai",
        state: "Maharashtra",
        zip: "400001",
        country: "India",
      };

      const mockAddresses = [];
      const mockUser = {
        _id: "user_123",
        addresses: mockAddresses,
        save: jest.fn().mockResolvedValue(true),
      };
      User.findById.mockResolvedValue(mockUser);

      await userController.addAddress(req, res, next);

      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({ fullName: "Home Address" }),
          ]),
        })
      );
    });
  });

  describe("DeleteAddress", () => {
    test("should call addresses.pull and save user to delete address", async () => {
      req.params.addressId = "addr_999";
      const mockAddresses = {
        pull: jest.fn(),
      };
      const mockUser = {
        _id: "user_123",
        addresses: mockAddresses,
        save: jest.fn().mockResolvedValue(true),
      };
      User.findById.mockResolvedValue(mockUser);

      await userController.deleteAddress(req, res, next);

      expect(mockUser.addresses.pull).toHaveBeenCalledWith({ _id: "addr_999" });
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockAddresses })
      );
    });
  });
});
