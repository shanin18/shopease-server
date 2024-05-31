const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();

const getProductDetailsById = (database) => {
  const productsCollection = database.collection("products");

  router.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      if (id) {
        const result = await productsCollection
          .findOne({ _id: new ObjectId(id) });
        res.json(result);
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};

module.exports = getProductDetailsById;
