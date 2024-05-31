const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const getProducts = require("./routes/getProducts");
const getProductDetailsById = require("./routes/getProductDetailsById");
const addProduct = require("./routes/addProduct");
const updateProduct = require("./routes/updateProduct");
const deleteProduct = require("./routes/deleteProduct");

// Start Server
const PORT = process.env.PORT || 5000;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

// Initialize Express App
const app = express();

// Middleware
const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

// Enable CORS
app.use(cors(corsConfig));
app.use(express.json());

const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.gacal02.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const database = client.db("shopease");

    // Routes
    app.use("/products", getProducts(database));
    app.use("/products", getProductDetailsById(database));
    app.use("/add-product", addProduct(database));
    app.use("/update-product", updateProduct(database));
    app.use("/delete-product", deleteProduct(database));
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to shopease server");
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
