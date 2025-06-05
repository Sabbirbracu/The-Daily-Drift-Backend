const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },

  bio: {
    type: String,
    maxlength: 360,
    default: "",
  },

  aboutMe: {
    type: String,
    maxlength: 2000,
    default: "",
  },

  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  socialLinks: {
    twitter: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    website: { type: String, default: "" },
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    reddit: { type: String, default: "" },
    youtube: { type: String, default: "" },
  },

  profileVisibility: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },

  // 🆕 Banner image at the top of profile
  bannerImage: {
    type: String,
    default: "", // Cloudinary or external URL
  },

  // 🆕 List of user's expertise/tags (e.g., "JavaScript", "AI")
  expertise: [
    {
      type: String,
      trim: true,
    },
  ],

  // 🆕 Pinned post (referenced by Post ID)
  pinnedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    default: null,
  },

  // 🆕 Reading list of saved/favorite posts
  readingList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserProfile", userProfileSchema);
