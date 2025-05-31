// models/Category.js

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // no duplicate categories
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // who created this category (usually admin)
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
