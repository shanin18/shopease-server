const express = require("express");
const router = express.Router();

const getProducts = (database) => {
  const productsCollection = database.collection("products");

  router.get("/", async (req, res) => {
    try {
      const result = await productsCollection.find().toArray();
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};

module.exports = getProducts;
