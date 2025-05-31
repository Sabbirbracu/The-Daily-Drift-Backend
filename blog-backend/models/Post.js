const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ text: String, votes: { type: Number, default: 0 } }],
});

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  metaTitle: { type: String }, // ✅ SEO Meta Title
  metaDescription: { type: String }, // ✅ SEO Meta Description
  tags: [{ type: String }], // ✅ Array of tags

  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  image: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  views: { type: Number, default: 0 },
  polls: [pollSchema],
  createdAt: { type: Date, default: Date.now },
  isSuspended: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["pending", "approved", "declined"],
    default: "pending",
  },
});

module.exports = mongoose.model("Post", postSchema);
