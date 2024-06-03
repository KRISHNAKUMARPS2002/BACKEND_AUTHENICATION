const express = require("express");
const { register, login, verifyOTP } = require("./controllers/userController");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define your routes using Express Router
const router = express.Router();

// Route for user registration
router.post("/register", register);

// Route for OTP verification (after registration)
router.post("/verify-otp", verifyOTP);

// Route for user login
router.post("/login", login);

// Use the router for handling routes
app.use("/api/users", router);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
