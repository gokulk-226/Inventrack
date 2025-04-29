const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/config/db");

// Route imports
const userRoutes = require("./src/routes/userRoutes");
const supplierRoutes = require("./src/routes/supplierRoutes");
const purchaseRoutes = require("./src/routes/purchaseRoutes");
const stockRoutes = require("./src/routes/stockRoutes");
const billingRoutes = require("./src/routes/billingRoutes"); // ✅ Added this line

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Route registration
app.use("/users", userRoutes);
app.use("/suppliers", supplierRoutes);
app.use("/purchases", purchaseRoutes);
app.use("/stock", stockRoutes);
app.use("/billing", billingRoutes); // ✅ Registered the billing route here

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
