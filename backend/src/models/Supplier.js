// models/Supplier.js
const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contactNo: { type: String, required: true }
});

module.exports = mongoose.model("Supplier", supplierSchema);
