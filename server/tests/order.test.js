const orderController = require("../src/controllers/order.controller");
const Order = require("../src/models/Order");
const Product = require("../src/models/Product");

jest.mock("../src/models/Order");
jest.mock("../src/models/Product");

describe("Order Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {
        shippingAddress: {
          fullName: "John Doe",
          phone: "9876543210",
          street: "123 Main St",
          city: "Mumbai",
          state: "Maharashtra",
          zip: "400001",
          country: "India"
        }
      },
      params: {},
      query: {},
      user: { _id: "user_mock_id_123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("Create Order", () => {
    test("should return 400 if items list is empty or missing", async () => {
      req.body.items = [];
      await orderController.create(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Order must have at least one item" })
      );
    });

    test("should return 400 if shippingAddress phone is invalid", async () => {
      req.body.items = [{ product: "prod_1", title: "Laptop", quantity: 1 }];
      req.body.shippingAddress.phone = "123456"; // invalid Indian format

      await orderController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Invalid phone number. Must be a valid 10-digit Indian mobile number." })
      );
    });

    test("should return 400 if shippingAddress zip is invalid", async () => {
      req.body.items = [{ product: "prod_1", title: "Laptop", quantity: 1 }];
      req.body.shippingAddress.zip = "4000"; // invalid length

      await orderController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Invalid zip/pincode. Must be a valid 6-digit Indian pincode." })
      );
    });

    test("should return 404 if a product in items is not found", async () => {
      req.body.items = [{ product: "invalid_id", title: "Missing Product", quantity: 1 }];
      Product.findById.mockResolvedValue(null);

      await orderController.create(req, res, next);

      expect(Product.findById).toHaveBeenCalledWith("invalid_id");
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Product not found: Missing Product" })
      );
    });

    test("should return 400 if product stock is insufficient", async () => {
      req.body.items = [{ product: "prod_1", title: "Laptop", quantity: 5 }];
      const mockProduct = {
        _id: "prod_1",
        title: "Laptop",
        trackQuantity: true,
        continueSelling: false,
        stock: 3,
      };
      Product.findById.mockResolvedValue(mockProduct);

      await orderController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Insufficient stock for product "Laptop". Only 3 available.',
        })
      );
    });

    test("should place order and decrement stock if stock is sufficient", async () => {
      req.body.items = [{ product: "prod_1", title: "Laptop", quantity: 2 }];
      req.body.shippingAddress = {
        fullName: "User",
        phone: "9876543210",
        street: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        zip: "400001",
        country: "India"
      };
      req.body.subtotal = 1000;
      req.body.total = 1050;

      const mockProduct = {
        _id: "prod_1",
        title: "Laptop",
        trackQuantity: true,
        continueSelling: false,
        stock: 10,
        save: jest.fn().mockResolvedValue(true),
      };
      Product.findById.mockResolvedValue(mockProduct);
      Order.create.mockResolvedValue({ _id: "order_123", ...req.body });

      await orderController.create(req, res, next);

      expect(mockProduct.stock).toBe(8); // decremented by 2
      expect(mockProduct.save).toHaveBeenCalled();
      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({ customer: "user_mock_id_123" })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });
  });

  describe("Cancel User Order", () => {
    test("should return 403 if order belongs to a different customer", async () => {
      req.params.id = "order_1";
      const mockOrder = {
        _id: "order_1",
        customer: "different_user_id",
      };
      Order.findById.mockResolvedValue(mockOrder);

      await orderController.cancelMyOrder(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Not authorised to cancel this order" })
      );
    });

    test("should return 400 if order is already processed, shipped or delivered", async () => {
      req.params.id = "order_1";
      const mockOrder = {
        _id: "order_1",
        customer: "user_mock_id_123",
        status: "shipped",
      };
      Order.findById.mockResolvedValue(mockOrder);

      await orderController.cancelMyOrder(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Cannot cancel order with status: shipped" })
      );
    });

    test("should cancel order and restore stock successfully", async () => {
      req.params.id = "order_1";
      const mockProduct = {
        _id: "prod_1",
        stock: 5,
        trackQuantity: true,
        save: jest.fn().mockResolvedValue(true),
      };
      const mockOrder = {
        _id: "order_1",
        customer: "user_mock_id_123",
        status: "pending",
        items: [{ product: "prod_1", quantity: 3 }],
        save: jest.fn().mockImplementation(function () {
          this.status = "cancelled";
          return Promise.resolve(this);
        }),
      };

      Order.findById.mockResolvedValue(mockOrder);
      Product.findById.mockResolvedValue(mockProduct);

      await orderController.cancelMyOrder(req, res, next);

      expect(mockProduct.stock).toBe(8); // restored by 3
      expect(mockProduct.save).toHaveBeenCalled();
      expect(mockOrder.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ status: "cancelled" }),
        })
      );
    });
  });

  describe("Admin Metrics Dashboard", () => {
    test("should return correct revenue and counts summary", async () => {
      Order.countDocuments
        .mockResolvedValueOnce(15) // totalOrders
        .mockResolvedValueOnce(3)  // pendingOrders
        .mockResolvedValueOnce(8); // deliveredOrders

      Order.aggregate.mockResolvedValue([{ totalRevenue: 15200 }]);

      await orderController.getMetrics(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: {
            totalOrders: 15,
            pendingOrders: 3,
            deliveredOrders: 8,
            totalRevenue: 15200,
          },
        })
      );
    });
  });
});
