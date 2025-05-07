const express = require("express");
const router = express.Router();
const NewsletterSubscriber = require("../models/NewsletterSubscriber"); // Assuming the Newsletter model is defined
const { connectDB, closeDB } = require("../db");

// Subscribe to the newsletter
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  // Validate email format (simple regex)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  try {
    // Open the database connection
    await connectDB(process.env.MONGO_URI);

    // Check if the email already exists in the database
    const existingSubscriber = await NewsletterSubscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: "Email already subscribed",
      });
    }

    // Create a new subscriber using the correct model
    const newSubscriber = new NewsletterSubscriber({
      email,
    });

    // Save the new subscriber to the database
    await newSubscriber.save();

    res.status(201).json({
      success: true,
      message: "Email saved!",
    });
  } catch (error) {
    console.error("Error saving subscriber:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    // Close the database connection
    closeDB();
  }
});

module.exports = router;
