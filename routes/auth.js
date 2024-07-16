const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret_key";

const authRoutes = (database) => {
  // Register a new user
  router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    console.log("Registering user:", email); // Log email for debugging
    const hashedPassword = await bcrypt.hash(password, 10);

    const usersCollection = database.collection("users");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      console.log("Email already exists:", email); // Log if email already exists
      return res.status(400).json({ message: "Email already exists" });
    }

    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign({ userId: result.insertedId, email }, jwtSecret, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertedId,
      token,
    });
  });

  // Login user and generate JWT
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Logging in user:", email); // Log email for debugging

    const usersCollection = database.collection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      console.log("Invalid email:", email); // Log invalid email
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user?.password);
    if (!isPasswordValid) {
      console.log("Invalid password for email:", email); // Log invalid password
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecret, {
      expiresIn: "1h",
    });
    res.json({ token });
  });

  return router;
};

module.exports = authRoutes;
