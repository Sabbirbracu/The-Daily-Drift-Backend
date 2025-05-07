const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../blog-backend/models/User");
const Post = require("../blog-backend/models/Post");
const Comment = require("../blog-backend/models/Comment");
const Analytic = require("../blog-backend/models/Analytic");

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("📡 Connected to DB");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Analytic.deleteMany({}),
  ]);

  // Create users
  const users = await User.insertMany([
    { name: "Samiha Khan", email: "samiha@example.com", password: "pass123" },
    { name: "Tanvir Rahman", email: "tanvir@example.com", password: "pass123" },
    { name: "Rafiul Islam", email: "rafi@example.com", password: "pass123" },
    { name: "Nabila Chowdhury", email: "nabila@example.com", password: "pass123" },
  ]);

  // Define categories and corresponding image URLs
  const categories = {
    Travel: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d",
      "https://images.unsplash.com/photo-1502920917128-1aa500764ce7",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    ],
    Food: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    ],
    Health: [
      "https://images.unsplash.com/photo-1551190822-a9333d879b1f",
      "https://images.unsplash.com/photo-1551190822-a9333d879b1f",
      "https://images.unsplash.com/photo-1551190822-a9333d879b1f",
      "https://images.unsplash.com/photo-1551190822-a9333d879b1f",
      "https://images.unsplash.com/photo-1551190822-a9333d879b1f",
    ],
    News: [
      "https://images.unsplash.com/photo-1581090700227-1e8e8f1a1b1b",
      "https://images.unsplash.com/photo-1581090700227-1e8e8f1a1b1b",
      "https://images.unsplash.com/photo-1581090700227-1e8e8f1a1b1b",
      "https://images.unsplash.com/photo-1581090700227-1e8e8f1a1b1b",
      "https://images.unsplash.com/photo-1581090700227-1e8e8f1a1b1b",
    ],
    Technology: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
      "https://images.unsplash.com/photo-1518770660439-4636190af475",
    ],
  };

  // Generate posts
  const posts = [];

  for (const [category, images] of Object.entries(categories)) {
    for (let i = 0; i < 5; i++) {
      posts.push({
        title: `${category} Post ${i + 1}`,
        content: `This is a sample ${category.toLowerCase()} blog post number ${i + 1}.`,
        author: users[i % users.length]._id,
        category,
        image: images[i],
      });
    }
  }

  const createdPosts = await Post.insertMany(posts);

  // Add comments
  const comments = [];

  createdPosts.forEach((post, index) => {
    comments.push({
      content: `This is a comment on ${post.title}.`,
      author: users[index % users.length]._id,
      post: post._id,
    });
  });

  const createdComments = await Comment.insertMany(comments);

  // Add analytics
  const analytics = createdPosts.map((post, index) => ({
    post: post._id,
    views: 100 + index * 10,
    comments: createdComments.filter((c) => c.post.toString() === post._id.toString()).length,
    likes: 10 + index * 2,
    shares: 5 + index,
  }));

  await Analytic.insertMany(analytics);

  console.log("✅ Seed data added successfully.");
  mongoose.disconnect();
}

seed();
