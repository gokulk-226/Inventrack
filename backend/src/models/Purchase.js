const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    pricePerUnit: { type: Number, required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
    category: { type: String, enum: ['Men', 'Women', 'Children'], required: true },
    dateOfPurchase: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', PurchaseSchema);
