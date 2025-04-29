const Stock = require('../models/Stock');

// GET all stock
exports.getStock = async (req, res) => {
    try {
        const stock = await Stock.find().populate('supplier', 'name');
        res.json(stock.map(item => ({
            _id: item._id,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            supplier: item.supplier.name
        })));
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// ✅ PUT /stock/:id - Update stock quantity
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        const updatedStock = await Stock.findByIdAndUpdate(
            id,
            { quantity },
            { new: true }
        );

        if (!updatedStock) {
            return res.status(404).json({ error: 'Stock item not found' });
        }

        res.json({
            message: 'Stock updated successfully',
            stock: updatedStock
        });
    } catch (error) {
        console.error("Error updating stock:", error);
        res.status(500).json({ error: 'Server error while updating stock' });
    }
};
