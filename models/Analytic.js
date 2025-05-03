const mongoose = require("mongoose");

const analyticSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  views: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Analytic", analyticSchema);
