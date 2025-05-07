const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'], 
    },
  },
  { timestamps: true } 
);

const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', subscriberSchema);

module.exports = NewsletterSubscriber;