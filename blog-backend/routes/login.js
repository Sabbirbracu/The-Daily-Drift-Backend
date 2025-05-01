const express = require("express");
const { closeDB, connectDB } = require("../db");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    await connectDB(process.env.MONGO_URI);
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message: "no user found!",
      });
    }
    const isPassMatch = await bcrypt.compare(password, user.password);
    if (!isPassMatch) {
      return res.json({
        message: "invalid credintial!",
      });
    }
    const acessToken = await jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    const refreshToken = await jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.json({
      message: "login successfull",
      acessToken,
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "login error accurd ",
      error,
    });
  } finally {
    await closeDB();
  }
});

module.exports = router;
