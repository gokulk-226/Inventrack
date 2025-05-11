const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 }
});

const billingSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  mobile: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid mobile number!`
    }
  },
  items: { type: [itemSchema], required: true },
  grandTotal: { type: Number, required: true, min: 0 },
  date: {
    type: String,  // Changed from Date to String
    required: true,
    default: () => {
      const now = new Date();
      return now.toISOString().split('T')[0]; // Stores only YYYY-MM-DD
    }
  }
});

// Removed the billNo pre-save hook completely

module.exports = mongoose.model('Billing', billingSchema);