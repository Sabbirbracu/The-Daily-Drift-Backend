// blog-backend/routes/email.js
const express = require("express");
const router = express.Router();
const sendMail = require("../utils/sendMail");

router.post("/", async (req, res) => {
  const { to, subject, text } = req.body;
  const result = await sendMail(to, subject, text);

  if (result.success) {
    res.status(200).json({ message: "Email sent successfully" });
  } else {
    res
      .status(500)
      .json({ message: "Failed to send email", error: result.error });
  }
});

module.exports = router;
