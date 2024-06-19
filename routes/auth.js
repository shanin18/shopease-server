const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret_key";

const authRoutes = (database) => {
  // Register a new user
  router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const usersCollection = database.collection("users");

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
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

    const usersCollection = database.collection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user?.password);
    if (!isPasswordValid) {
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
