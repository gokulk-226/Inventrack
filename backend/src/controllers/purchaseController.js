const Purchase = require('../models/Purchase');
const Stock = require('../models/Stock');

exports.addPurchase = async (req, res) => {
    try {
        const { name, quantity, pricePerUnit, supplier, category } = req.body;

        // Store the purchase in the Purchase collection
        const newPurchase = new Purchase({ name, quantity, pricePerUnit, supplier, category });
        await newPurchase.save();

        // Check if a stock entry with the same name, category, supplier, and pricePerUnit exists
        let stockItem = await Stock.findOne({ name, category, supplier, pricePerUnit });

        if (stockItem) {
            // If stock exists with the exact details, update quantity
            stockItem.quantity += quantity;
            await stockItem.save();
        } else {
            // Create a new stock entry if a different supplier, category, or price is provided
            const newStockItem = new Stock({ name, quantity, pricePerUnit, supplier, category });
            await newStockItem.save();
        }

        res.status(201).json({ message: 'Purchase added and stock updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.find()
            .sort({ dateOfPurchase: -1 })
            .populate('supplier', 'name');
        res.json(purchases);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deletePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        if (!purchase) {
            return res.status(404).json({ error: 'Purchase not found' });
        }

        // Find the corresponding stock entry (match by name, category, supplier, and pricePerUnit)
        const stockItem = await Stock.findOne({ 
            name: purchase.name, 
            category: purchase.category, 
            supplier: purchase.supplier, 
            pricePerUnit: purchase.pricePerUnit 
        });

        if (stockItem) {
            stockItem.quantity -= purchase.quantity;
            if (stockItem.quantity <= 0) {
                await Stock.findByIdAndDelete(stockItem._id); // Remove stock if quantity reaches zero
            } else {
                await stockItem.save(); // Save updated stock
            }
        }

        // Delete the purchase record
        await Purchase.findByIdAndDelete(req.params.id);

        res.json({ message: 'Purchase deleted and stock updated' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

