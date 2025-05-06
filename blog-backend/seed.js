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

  // Create posts
  const posts = await Post.insertMany([
    {
      title: "The Future of AI in Everyday Life",
      content: "Artificial Intelligence is rapidly becoming integrated into our daily routines. From smart assistants to self-driving cars, AI is not just the future—it’s already here. In this post, we explore how it's shaping industries like healthcare, education, and even entertainment.",
      author: users[0]._id,
    },
    {
      title: "Breaking News: Global Climate Agreement Reached",
      content: "World leaders have signed a historic climate accord to limit global warming to 1.5°C. This agreement marks a pivotal moment in the fight against climate change, with countries committing to major emissions cuts and clean energy transitions.",
      author: users[1]._id,
    },
    {
      title: "Top 5 Hidden Gems to Visit in Southeast Asia",
      content: "Southeast Asia is full of stunning destinations off the beaten path. In this article, we cover hidden beaches in the Philippines, serene mountains in Vietnam, and cultural gems in Laos that will elevate your travel experience.",
      author: users[2]._id,
    },
    {
      title: "Healthy Eating: 10 Superfoods to Add to Your Diet",
      content: "Superfoods can play a crucial role in maintaining your health. From blueberries and quinoa to leafy greens and chia seeds, these nutrient-rich foods support immunity, digestion, and energy levels naturally.",
      author: users[3]._id,
    },
    {
      title: "Welcome to The Daily Drift!",
      content: "We're excited to launch our new platform dedicated to insightful articles, diverse opinions, and community-driven content. Whether you're into tech, lifestyle, or global affairs, there's something here for everyone.",
      author: users[0]._id,
    },
  ]);

  // Add comments
  const comments = await Comment.insertMany([
    {
      content: "This was a very insightful post!",
      author: users[1]._id,
      post: posts[0]._id,
    },
    {
      content: "Thanks for sharing the updates!",
      author: users[2]._id,
      post: posts[1]._id,
    },
    {
      content: "Adding these spots to my bucket list!",
      author: users[3]._id,
      post: posts[2]._id,
    },
    {
      content: "Love how concise and informative this is.",
      author: users[0]._id,
      post: posts[3]._id,
    },
    {
      content: "Excited to be part of this new platform!",
      author: users[2]._id,
      post: posts[4]._id,
    },
  ]);

  // Add analytics
  const analytics = await Analytic.insertMany(
    posts.map((post, index) => ({
      post: post._id,
      views: 100 + index * 25,
      comments: comments.filter((c) => c.post.toString() === post._id.toString()).length,
      likes: 10 + index * 3,
      shares: 5 + index,
    }))
  );

  console.log("✅ Seed data added successfully.");
  mongoose.disconnect();
}

seed();
