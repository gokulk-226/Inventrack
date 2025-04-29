const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true }, 
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true }
});

module.exports = mongoose.model('Stock', StockSchema);
