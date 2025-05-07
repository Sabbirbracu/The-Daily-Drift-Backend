const express = require("express");
const NewsletterSubscriber = require("../models/NewsletterSubscriber");
const router = express.Router();

// POST /api/newsletter/subscribe
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  // Email validation
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  try {
    // Check if the email already exists
    const existingSubscriber = await NewsletterSubscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ success: false, message: "Email already subscribed!" });
    }

    // Create a new subscriber
    const newSubscriber = new NewsletterSubscriber({ email });
    await newSubscriber.save();

    // Return success response
    res.status(200).json({ success: true, message: "Email saved!" });
  } catch (error) {
    console.error("Error saving subscriber:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
