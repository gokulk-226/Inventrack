const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoute = require("./router/product");
const storeRoute = require("./router/store");
const purchaseRoute = require("./router/purchase");
const salesRoute = require("./router/sales");
const User = require("./models/users");
const Product = require("./models/Product");

const app = express();
const PORT = 4000;

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for all routes

// Connect to MongoDB
const connectToMongoDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Inventery_Management", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if MongoDB connection fails
  }
};

connectToMongoDB();

// Routes
app.use("/api/store", storeRoute); // Store API
app.use("/api/product", productRoute); // Products API
app.use("/api/purchase", purchaseRoute); // Purchase API
app.use("/api/sales", salesRoute); // Sales API

// ------------- Authentication Routes --------------
let userAuthCheck; // Temporary storage for logged-in user (for demonstration purposes)

// Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });

    if (user) {
      res.status(200).json(user); // Send user details if credentials are valid
      userAuthCheck = user; // Store the logged-in user (temporary)
    } else {
      res.status(401).json({ message: "Invalid Credentials" }); // Unauthorized
      userAuthCheck = null; // Clear stored user
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get Logged-in User Details
app.get("/api/login", (req, res) => {
  if (userAuthCheck) {
    res.status(200).json(userAuthCheck);
  } else {
    res.status(404).json({ message: "No user logged in" });
  }
});

// Registration Route
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, imageUrl } = req.body;

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      imageUrl,
    });

    console.log("Saving user:", newUser); // Debugging
    const savedUser = await newUser.save();
    console.log("User saved:", savedUser); // Debugging
    res.status(201).json(savedUser); // Send the saved user details
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Test Route to Fetch a Product
app.get("/testget", async (req, res) => {
  try {
    const product = await Product.findOne({ _id: "6429979b2e5434138eda1564" });
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("TestGet Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});