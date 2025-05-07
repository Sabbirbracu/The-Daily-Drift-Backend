const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Post = require("../models/Post");

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await Post.deleteMany({});
    console.log(`Deleted ${result.deletedCount} posts.`);
    process.exit();
  } catch (error) {
    console.error("Failed to clear posts:", error);
    process.exit(1);
  }
})();
