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

  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Analytic.deleteMany({}),
  ]);

  const users = await User.insertMany([
    { name: "Samiha Khan", email: "samiha@example.com", password: "pass123" },
    { name: "Tanvir Rahman", email: "tanvir@example.com", password: "pass123" },
    { name: "Rafiul Islam", email: "rafi@example.com", password: "pass123" },
    { name: "Nabila Chowdhury", email: "nabila@example.com", password: "pass123" },
  ]);

  const postsData = {
    Travel: [
      "Exploring the Amalfi Coast",
      "A Solo Trip Through Patagonia",
      "Budget Travel Tips for Europe",
      "Top 5 Hidden Beaches in Bali",
      "Backpacking the Himalayas",
    ],
    News: [
      "Global Leaders Sign Climate Accord",
      "Election 2025: What You Need to Know",
      "Economic Outlook for Next Quarter",
      "SpaceX Announces New Mission",
      "Tech Giants Face New Regulations",
    ],
    Health: [
      "10 Superfoods Backed by Science",
      "The Mental Health Crisis Explained",
      "Morning Routines That Improve Focus",
      "How to Stay Fit Without a Gym",
      "Meditation Techniques That Work",
    ],
    Tech: [
      "AI Tools Changing the Workplace",
      "Is Web3 Still Relevant?",
      "Quantum Computing: Explained Simply",
      "Must-Have Developer Tools in 2025",
      "How 5G Is Shaping the Future",
    ],
    Food: [
      "Homemade Pasta From Scratch",
      "Top 10 Street Foods in Asia",
      "What is Plant-Based Eating?",
      "Fermented Foods and Gut Health",
      "Easy 30-Minute Dinners",
    ],
  };

  const posts = [];

  for (const [category, titles] of Object.entries(postsData)) {
    titles.forEach((title) => {
      posts.push({
        title,
        content: `${title} - This article explores interesting insights, tips, or news related to ${category.toLowerCase()}.`,
        category,
        image: `https://source.unsplash.com/800x400/?${category.toLowerCase()}`,
        author: users[Math.floor(Math.random() * users.length)]._id,
        isSuspended: false,
        views: Math.floor(Math.random() * 100),
        likes: [],
        polls: [],
        createdAt: new Date(),
      });
    });
  }

  const createdPosts = await Post.insertMany(posts);

  const comments = [];
  for (let i = 0; i < 20; i++) {
    comments.push({
      content: `This is comment #${i + 1}`,
      author: users[i % users.length]._id,
      post: createdPosts[i % createdPosts.length]._id,
    });
  }

  const createdComments = await Comment.insertMany(comments);

  const analytics = await Analytic.insertMany(
    createdPosts.map((post) => ({
      post: post._id,
      views: post.views,
      comments: createdComments.filter((c) => c.post.toString() === post._id.toString()).length,
      likes: Math.floor(Math.random() * 30),
      shares: Math.floor(Math.random() * 10),
    }))
  );

  console.log("✅ 25 posts (5 per category) seeded with users, comments, and analytics.");
  mongoose.disconnect();
}

seed();
