// controllers/supplierController.js
const Supplier = require("../models/Supplier");

// Get all suppliers
exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch suppliers" });
    }
};

// Add a new supplier
exports.addSupplier = async (req, res) => {
    const { name, email, contactNo } = req.body;

    if (!name || !email || !contactNo) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format!" });
    }

    try {
        const existingSupplier = await Supplier.findOne({ email });
        if (existingSupplier) {
            return res.status(400).json({ error: "Email already exists!" });
        }

        const newSupplier = new Supplier({ name, email, contactNo });
        await newSupplier.save();
        res.status(201).json(newSupplier);
    } catch (error) {
        res.status(500).json({ error: "Error adding supplier" });
    }
};

// Update supplier
exports.updateSupplier = async (req, res) => {
    const { name, email, contactNo } = req.body;
    const { id } = req.params;

    if (!name || !email || !contactNo) {
        return res.status(400).json({ error: "Fields cannot be empty!" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format!" });
    }

    try {
        const existingSupplier = await Supplier.findOne({ email });
        if (existingSupplier && existingSupplier._id.toString() !== id) {
            return res.status(400).json({ error: "Email already exists!" });
        }

        const updatedSupplier = await Supplier.findByIdAndUpdate(
            id, { name, email, contactNo }, { new: true }
        );
        res.json(updatedSupplier);
    } catch (error) {
        res.status(500).json({ error: "Error updating supplier" });
    }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
    try {
        await Supplier.findByIdAndDelete(req.params.id);
        res.json({ message: "Supplier deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting supplier" });
    }
};
