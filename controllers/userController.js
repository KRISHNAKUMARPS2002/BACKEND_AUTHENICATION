const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");

// JWT secret key
const JWT_SECRET = "your_jwt_secret";

// Register a new user
exports.register = async (req, res) => {
  const { username, password, email, role } = req.body;

  try {
    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false,
    });

    // Generate JWT token
    const token = jwt.sign({ email, role }, JWT_SECRET);

    // Store OTP and JWT token in the database
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.query(
      "INSERT INTO users (username, password, email, role, otp_code, jwt_token) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [username, hashedPassword, email, role, otp, token]
    );

    // Log registration process
    console.log(
      `User registered: ${username} (${email}), OTP: ${otp}, `
      //JWT Token: ${token}
    );

    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Verify OTP for user registration
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await db.query(
      "SELECT * FROM users WHERE email = $1 AND otp_code = $2",
      [email, otp]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    // Update user status to 'verified' and clear OTP code
    await db.query(
      "UPDATE users SET status = 'verified', otp_code = null WHERE email = $1",
      [email]
    );

    // Log OTP verification process
    console.log(`OTP verified for user: ${email}`);

    res
      .status(200)
      .json({ msg: "OTP verified successfully. User status updated." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Login a user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Log login attempt
    console.log(`User login attempt: ${email}`);

    const user = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      console.log(`Login failed: User with email ${email} not found`);
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);

    if (!isMatch) {
      console.log(`Login failed: Incorrect password for user ${email}`);
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET);
    console.log(`User logged in: ${email}`);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
