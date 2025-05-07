const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }
});

const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', subscriberSchema);

module.exports = NewsletterSubscriber;
