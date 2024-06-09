const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

const deleteProduct = (database) => {
  const productsCollection = database.collection("products");

  router.delete("/:id", async (req, res) => {
    try {
      const productId = req.params.id;

      // Validate product ID
      if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const query = { _id: new ObjectId(productId) };
      const result = await productsCollection.deleteOne(query);

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(201).json(result);
    } catch (err) {
      console.error("Error deleting product:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return router;
};

module.exports = deleteProduct;
