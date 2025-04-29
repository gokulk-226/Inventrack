const Billing = require("../models/Billing");

// Utility to format date to dd-mm-yy
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

// Create a new bill and store it in the DB
const createBill = async (req, res) => {
  try {
    const { name, quantity, price, totalPrice, customerName, mobile } = req.body;

    if (!customerName || !mobile) {
      return res.status(400).json({ error: "Customer name and mobile are required." });
    }

    const newBill = new Billing({
      name,
      quantity,
      price,
      totalPrice,
      customerName,
      mobile,
      date: new Date(),
    });

    const savedBill = await newBill.save();

    res.status(201).json({
      ...savedBill._doc,
      date: formatDate(savedBill.date),
    });
  } catch (err) {
    console.error("Error saving the bill:", err);
    res.status(500).json({ error: "Error saving the bill" });
  }
};

// Fetch all bills from the database
const getAllBills = async (req, res) => {
  try {
    const bills = await Billing.find().sort({ date: -1 });

    const formattedBills = bills.map((bill) => ({
      ...bill._doc,
      date: formatDate(bill.date),
    }));

    res.status(200).json(formattedBills);
  } catch (err) {
    console.error("Error fetching bills:", err);
    res.status(500).json({ error: "Error fetching bills" });
  }
};

module.exports = {
  createBill,
  getAllBills,
};
