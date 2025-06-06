const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  fullName: { type: String, required: true },
  displayName: { type: String, required: true, unique: true },

  dob: { type: Date },
  gender: { type: String },
  nationality: { type: String },
  address: { type: String },
  phone: { type: String },
  language: { type: String },
  timezone: { type: String },

  profileImage: { type: String, default: "" },

  accountCreated: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  accountType: { type: String, enum: ["User", "Admin"], default: "User" },
  accountVerified: {
    type: String,
    enum: ["Verified", "Unverified"],
    default: "Unverified",
  },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isVerified: { type: Boolean, default: false },
  reputation: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  suspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },

  // 🔐 Password reset fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
