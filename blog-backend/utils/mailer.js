const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log("Email connection failed:", error);
  } else {
    console.log("Email server is ready to take messages");
  }
});

module.exports = transporter;
