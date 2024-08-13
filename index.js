const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { ObjectId } = require("mongodb");
const { MongoClient, ServerApiVersion } = require("mongodb");
const authMiddleware = require("./middleware/authMiddleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Start Server
const PORT = process.env.PORT || 5000;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const jwtSecret = process.env.JWT_SECRET || "my_jwt_secret_key";

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
app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

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

    // collections
    const productsCollection = database.collection("products");
    const usersCollection = database.collection("users");

    // get all products
    app.get("/products", async (req, res) => {
      try {
        const result = await productsCollection.find().toArray();
        res.json(result);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    // get single product by using its id
    app.get("/products/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (id) {
          const result = await productsCollection.findOne({
            _id: new ObjectId(id),
          });
          res.json(result);
        }
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    // adding a new product
    app.post("/products", authMiddleware, async (req, res) => {
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

    // update a product
    app.put("/products/:id", authMiddleware, async (req, res) => {
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

    // delete a product
    app.delete("/products/:id", authMiddleware, async (req, res) => {
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

    // getting users
    app.get("/users", async (req, res) => {
      try {
        const result = await usersCollection.find().toArray();
        res.json(result);
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    });

    // Register a new user
    app.post("/users/register", async (req, res) => {
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
    app.post("/users/login", async (req, res) => {
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

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        jwtSecret,
        {
          expiresIn: "1h",
        }
      );
      res.json({ token });
    });
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
