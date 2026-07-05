const productController = require("../src/controllers/product.controller");
const Product = require("../src/models/Product");
const Category = require("../src/models/Category");
const Review = require("../src/models/Review");

jest.mock("../src/models/Product");
jest.mock("../src/models/Category");
jest.mock("../src/models/Review");

describe("Product Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
      user: { _id: "user_123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("GetAll", () => {
    test("should fetch products list with pagination defaults", async () => {
      const mockProducts = [{ title: "Laptop" }, { title: "Mobile" }];
      const mockFind = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockProducts),
      };

      Product.find.mockReturnValue(mockFind);
      Product.countDocuments.mockResolvedValue(10);
      Product.aggregate.mockResolvedValue([
        {
          active: [{ count: 5 }],
          draft: [{ count: 2 }],
          archived: [{ count: 3 }],
          lowStock: [{ count: 1 }],
        },
      ]);

      await productController.getAll(req, res, next);

      expect(Product.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockProducts,
          pagination: expect.objectContaining({ total: 10 }),
        })
      );
    });
  });

  describe("GetById", () => {
    test("should return 404 if product is not found", async () => {
      req.params.id = "prod_invalid";
      const mockPopulate = {
        populate: jest.fn().mockResolvedValue(null),
      };
      Product.findById.mockReturnValue(mockPopulate);

      await productController.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Product not found" })
      );
    });

    test("should return product details if found", async () => {
      req.params.id = "prod_123";
      const mockProductObj = { _id: "prod_123", title: "Laptop" };
      const mockProduct = {
        _id: "prod_123",
        title: "Laptop",
        toObject: jest.fn().mockReturnValue(mockProductObj),
      };
      const mockPopulate = {
        populate: jest.fn().mockResolvedValue(mockProduct),
      };
      Product.findById.mockReturnValue(mockPopulate);
      Review.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      await productController.getById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ title: "Laptop" }),
        })
      );
    });
  });

  describe("GetBySlug", () => {
    test("should return product based on slug query", async () => {
      req.params.slug = "laptop-123";
      const mockProductObj = { _id: "prod_123", title: "Laptop", slug: "laptop-123" };
      const mockProduct = {
        _id: "prod_123",
        title: "Laptop",
        slug: "laptop-123",
        toObject: jest.fn().mockReturnValue(mockProductObj),
      };
      const mockPopulate = {
        populate: jest.fn().mockResolvedValue(mockProduct),
      };
      Product.findOne.mockReturnValue(mockPopulate);
      Review.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([]),
      });

      await productController.getBySlug(req, res, next);

      expect(Product.findOne).toHaveBeenCalledWith({ slug: "laptop-123" });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ slug: "laptop-123" }),
        })
      );
    });
  });

  describe("Create Product", () => {
    test("should create product when valid payload and category exists", async () => {
      req.body = { title: "Earphones", price: 500, stock: 50, category: "cat_123" };
      const mockCreated = { _id: "prod_earphone", ...req.body };

      Category.findById.mockResolvedValue({ _id: "cat_123", name: "Gadgets" });
      Product.create.mockResolvedValue(mockCreated);

      await productController.create(req, res, next);

      expect(Product.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Earphones", price: 500, category: "cat_123" })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockCreated })
      );
    });
  });

  describe("Delete Product", () => {
    test("should return 404 on deleting non-existent product", async () => {
      req.params.id = "invalid_id";
      Product.findByIdAndDelete.mockResolvedValue(null);

      await productController.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    test("should successfully delete and return success message", async () => {
      req.params.id = "prod_123";
      Product.findByIdAndDelete.mockResolvedValue({ _id: "prod_123" });

      await productController.delete(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: "Product deleted" })
      );
    });
  });
});
