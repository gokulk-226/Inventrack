const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true, min: 0 }
});

const billingSchema = new mongoose.Schema({
  billNo: { type: Number, required: true },
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
    type: Date,
    required: true,
    default: () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  }
});

// Auto-increment billNo based on date
billingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastBill = await this.constructor.findOne({
      date: today
    }).sort({ billNo: -1 });
    
    this.billNo = lastBill ? lastBill.billNo + 1 : 1;
    this.date = today;
  }
  next();
});

module.exports = mongoose.model('Billing', billingSchema);