const mongoose = require('mongoose');
const dotenv = require('dotenv');
const posts = require('./seedData');
const Post = require('./models/Post'); // Adjust the path to your post model

dotenv.config();

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Optional: Clear existing data
    await Post.deleteMany({});

    // Insert new sample data
    await Post.insertMany(posts);
    console.log('✅ Data seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
