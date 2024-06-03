const express = require("express");
const { register, login, verifyOTP } = require("../controllers/userController");

// const router = express.Router();

// Route for user registration
router.post("/register", register);

// Route for OTP verification (after registration)
router.post("/verify-otp", verifyOTP);

// Route for user login
router.post("/login", login);

module.exports = router;
