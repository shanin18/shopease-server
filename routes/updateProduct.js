const express = require("express");
const { ObjectId } = require("mongodb");

const router = express.Router();

const updateProduct = (database) => {
  const productsCollection = database.collection("products");

  router.put("/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      const updatedProductData = req.body;

      // Validate input data
      if (!ObjectId.isValid(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      // Update data
      const filter = { _id: new ObjectId(productId) };
      const updateData = {
        $set: {
          name: updatedProductData.name,
          seller: updatedProductData.seller,
          category: updatedProductData.category,
          price: updatedProductData.price,
          ratings: updatedProductData.ratings,
          img: updatedProductData.img,
          stock: updatedProductData.stock,
          shipping: updatedProductData.shipping,
          ratingsCount: updatedProductData.ratingsCount,
          quantity: updatedProductData.quantity,
        },
      };
      const options = { upsert: true };

      const result = await productsCollection.updateOne(
        filter,
        updateData,
        options
      );
      res.status(201).json(result);
    } catch (err) {
      console.error("Error updating product:", err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return router;
};

module.exports = updateProduct;
