const categoryController = require("../src/controllers/category.controller");
const Category = require("../src/models/Category");

jest.mock("../src/models/Category");
jest.mock("../src/helpers/imageUpload", () => ({
  uploadSingle: jest.fn().mockResolvedValue("https://cloudinary.com/test.jpg"),
}));

describe("Category Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("GetAll", () => {
    test("should fetch all categories sorted by name", async () => {
      const mockCategories = [{ name: "Category A" }, { name: "Category B" }];
      const mockFind = {
        sort: jest.fn().mockResolvedValue(mockCategories),
      };
      Category.find.mockReturnValue(mockFind);

      req.query.isActive = "true";
      await categoryController.getAll(req, res, next);

      expect(Category.find).toHaveBeenCalledWith({ isActive: true });
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockCategories })
      );
    });
  });

  describe("GetById", () => {
    test("should return 404 if category is not found", async () => {
      req.params.id = "invalid_id";
      Category.findById.mockResolvedValue(null);

      await categoryController.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Category not found" })
      );
    });

    test("should return category if found", async () => {
      req.params.id = "cat_123";
      const mockCategory = { _id: "cat_123", name: "Electronics" };
      Category.findById.mockResolvedValue(mockCategory);

      await categoryController.getById(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockCategory })
      );
    });
  });

  describe("Create Category", () => {
    test("should create category with text fields and body image url", async () => {
      req.body = { name: "Fashion", image: "https://example.com/img.jpg" };
      const mockCreatedCategory = { _id: "cat_fashion", ...req.body };
      Category.create.mockResolvedValue(mockCreatedCategory);

      await categoryController.create(req, res, next);

      expect(Category.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Fashion", image: "https://example.com/img.jpg" })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockCreatedCategory })
      );
    });
  });

  describe("Update Category", () => {
    test("should update existing category and return modified document", async () => {
      req.params.id = "cat_123";
      req.body = { name: "New Name" };
      const mockExisting = { _id: "cat_123", name: "Old Name", image: "" };
      const mockUpdated = { _id: "cat_123", name: "New Name", image: "" };

      Category.findById.mockResolvedValue(mockExisting);
      Category.findByIdAndUpdate.mockResolvedValue(mockUpdated);

      await categoryController.update(req, res, next);

      expect(Category.findByIdAndUpdate).toHaveBeenCalledWith(
        "cat_123",
        expect.objectContaining({ name: "New Name" }),
        { new: true, runValidators: true }
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, data: mockUpdated })
      );
    });
  });

  describe("Delete Category", () => {
    test("should return 404 if trying to delete non-existent category", async () => {
      req.params.id = "missing_id";
      Category.findByIdAndDelete.mockResolvedValue(null);

      await categoryController.delete(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: "Category not found" })
      );
    });

    test("should delete category successfully", async () => {
      req.params.id = "cat_123";
      Category.findByIdAndDelete.mockResolvedValue({ _id: "cat_123" });

      await categoryController.delete(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: "Category deleted" })
      );
    });
  });
});
