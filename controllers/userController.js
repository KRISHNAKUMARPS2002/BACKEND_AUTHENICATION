const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Your hardcoded JWT secret key
const JWT_SECRET = "your_jwt_secret";

// Register a new user
exports.register = async (req, res) => {
  const { username, password, email, role } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log(`User with email ${email} already exists`);
      return res
        .status(400)
        .json({ msg: "User already exists. Please provide unique values." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.query(
      "INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, hashedPassword, email, role]
    );

    const token = jwt.sign({ userId: newUser.rows[0].id }, JWT_SECRET);
    console.log(`User registered: ${username} (${email})`);
    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Login a user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
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
