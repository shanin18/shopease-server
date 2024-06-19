const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret_key";

const authRoutes = (database) => {
  // Register a new user
  router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const usersCollection = database.collection("users");

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const result = await usersCollection.insertOne({
      username,
      password: hashedPassword,
    });
    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertedId,
    });
  });

  // Login user and generate JWT
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const usersCollection = database.collection("users");

    const user = await usersCollection.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user?.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      jwtSecret,
      { expiresIn: "1h" }
    );
    res.json({ token });
  });

  return router;
};

module.exports = authRoutes;
