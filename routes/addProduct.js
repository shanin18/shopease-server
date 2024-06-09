const express = require("express");
const router = express.Router();

const addProduct = (database) => {
  const productsCollection = database.collection("products");

  router.post("/", async (req, res) => {
    try {
      const data = req.body;
      if (!data) {
        return res.status(400).json({ message: "Request body is empty" });
      }
      const result = await productsCollection.insertOne(data);
      res.status(201).json(result);
    } catch (err) {
      console.error("Error adding product:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return router;
};

module.exports = addProduct;
