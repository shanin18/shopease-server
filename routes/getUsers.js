const express = require("express");
const router = express.Router();

const getUsers = (database) => {
  const usersCollection = database.collection("users");

  router.get("/", async (req, res) => {
    try {
      const result = await usersCollection.find().toArray();
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};

module.exports = getUsers;
