const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const auth = require("../middleware/auth"); // your auth middleware

// GET all categories (public)
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
});

// CREATE category (admin only)

router.post("/", auth(["admin"]), async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    const exists = await Category.findOne({ name: name.toLowerCase() });
    if (exists) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const category = new Category({
      name,
      createdBy: req.user.id,
    });

    console.log("Creating category:", category);

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error("Error saving category:", error);
    res
      .status(500)
      .json({ message: "Error creating category", error: error.message });
  }
});

// UPDATE category by id (admin only)
router.put("/:id", auth(["admin"]), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name) category.name = name;

    await category.save();
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error updating category" });
  }
});

// DELETE category by id (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // FIX: Use deleteOne instead of remove
    await category.deleteOne(); // ✅ or Category.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
});

module.exports = router;
