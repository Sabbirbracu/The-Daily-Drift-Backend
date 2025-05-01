const express = require("express");
const { closeDB, connectDB } = require("../db");
const User = require("../models/User");
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    connectDB(process.env.MONGO_URI);
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.json({
      message: "registaion succesfull ",
      newUser,
    });
  } catch (error) {
    console.log(error);
    res.json({
      message: "registaion error ",
      error,
    });
  } finally {
    closeDB();
  }
});

module.exports = router;
