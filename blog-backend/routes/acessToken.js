const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.json({
        message: "no refresh token found! please login again",
      });
    const user = await jwt.verify(refreshToken, process.env.JWT_SECRET);
    const acessToken = await jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "acess token created successfully", acessToken });
  } catch (error) {
    console.log(error);
    res.json({
      message: "can not get acess token, something went wrong!",
    });
  }
});

module.exports = router;
