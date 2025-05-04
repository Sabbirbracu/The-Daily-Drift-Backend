const mongoose = require("mongoose");

const connectDB = async (MONGODB_URI) => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected...");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

const closeDB = async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed...");
};

module.exports = { connectDB, closeDB };
