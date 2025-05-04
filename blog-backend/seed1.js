const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../blog-backend/models/User");
const Post = require("../blog-backend/models/Post");
const Comment = require("../blog-backend/models/Comment");
const Analytic = require("../blog-backend/models/Analytic");
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Analytic.deleteMany({});

    // Create users
    const users = await User.insertMany([
      { name: "Alice Johnson", email: "alice@example.com", password: "password123" },
      { name: "Bob Smith", email: "bob@example.com", password: "password123" },
      { name: "Charlie Lee", email: "charlie@example.com", password: "password123" },
      { name: "Dana White", email: "dana@example.com", password: "password123", role: "admin" },
    ]);

    // Create posts
    const posts = await Post.insertMany([
      {
        title: "The Future of AI in Everyday Life",
        content: "Artificial Intelligence is reshaping how we interact with technology, from smart assistants to self-driving cars...",
        author: users[0]._id,
        category: "Technology",
        image: "https://source.unsplash.com/800x400/?technology",
      },
      {
        title: "Breaking: Major Changes in Global Politics",
        content: "Today marks a significant shift in international relations as global leaders convene to discuss climate action...",
        author: users[1]._id,
        category: "News",
        image: "https://source.unsplash.com/800x400/?news,politics",
      },
      {
        title: "Exploring the Hidden Gems of Iceland",
        content: "From majestic waterfalls to volcanic landscapes, Iceland offers breathtaking scenery for the adventurous traveler...",
        author: users[2]._id,
        category: "Travel",
        image: "https://source.unsplash.com/800x400/?iceland,travel",
      },
      {
        title: "10 Simple Habits for a Healthier Life",
        content: "Small daily habits like drinking water, walking, and mindfulness can drastically improve your overall well-being...",
        author: users[0]._id,
        category: "Health",
        image: "https://source.unsplash.com/800x400/?health,wellness",
      },
      {
        title: "How Quantum Computing Will Change the World",
        content: "Quantum computers are no longer theoretical. Learn how they may revolutionize medicine, finance, and encryption...",
        author: users[1]._id,
        category: "Technology",
        image: "https://source.unsplash.com/800x400/?quantum,computer",
      },
    ]);

    console.log("Seed data inserted successfully");
    process.exit();
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seed();
