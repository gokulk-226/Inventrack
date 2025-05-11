const { MongoClient } = require("mongodb");
const jsPDF = require("jspdf");
const Billing = require("../models/Billing");

// Utility to format date to dd-mm-yy
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

// Generate PDF using jsPDF
const generatePDF = (billData) => {
  const doc = new jsPDF();
  const { customerName, mobile, items, grandTotal, date, billNo } = billData;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("KPS SILKS", 20, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("415 Uthukuli Road,", 20, 28);
  doc.text("Kunnnathur, Tamil Nadu - 638103", 20, 33);

  doc.setFontSize(12);
  doc.text(`Date: ${formatDate(date)}`, 150, 20, { align: "right" });
  doc.text(`Bill No: ${billNo}`, 150, 28, { align: "right" });

  doc.text(`Customer Name : ${customerName}`, 20, 45);
  doc.text(`Mobile Number : +91 ${mobile}`, 20, 50);

  doc.text("-------------------------------------------------------------", 20, 55);

  let y = 65;
  let calculatedTotal = 0;

  items.forEach((item, idx) => {
    doc.text(`${idx + 1}) Product: ${item.name}`, 20, y);
    doc.text(`Qty: ${item.quantity}, Price: Rs. ${item.price.toFixed(2)}`, 30, y + 7);
    doc.text(`Total: Rs. ${item.totalPrice.toFixed(2)}`, 30, y + 14);
    calculatedTotal += item.totalPrice;
    y += 20;
  });

  doc.text("-------------------------------------------------------------", 20, y);
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total: Rs. ${calculatedTotal.toFixed(2)}`, 20, y + 10);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your purchase!", 20, y + 20);

  return doc.output("arraybuffer");
};

// Create a new bill and save to database
const createBill = async (req, res) => {
  try {
    const { customerName, mobile, items } = req.body;

    if (!customerName || !mobile || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Customer details and at least one item are required." });
    }

    // Calculate totals for each item and grand total
    const processedItems = items.map(item => ({
      ...item,
      totalPrice: item.price * item.quantity
    }));

    const grandTotal = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Get the next bill number
    const lastBill = await Billing.findOne().sort({ billNo: -1 });
    const billNo = lastBill ? lastBill.billNo + 1 : 1;

    const newBill = new Billing({
      billNo,
      customerName,
      mobile,
      items: processedItems,
      grandTotal,
      date: new Date()
    });

    const savedBill = await newBill.save();
    const pdfBuffer = generatePDF(savedBill.toObject());

    res.status(201).json({
      message: "Bill created successfully",
      bill: savedBill,
      pdf: pdfBuffer.toString("base64") // Send PDF as base64 string
    });
  } catch (err) {
    console.error("Error creating bill:", err);
    res.status(500).json({ error: "Error creating bill" });
  }
};

// Get all bills
const getAllBills = async (req, res) => {
  try {
    const bills = await Billing.find().sort({ billNo: -1 });
    res.status(200).json(bills);
  } catch (err) {
    console.error("Error fetching bills:", err);
    res.status(500).json({ error: "Error fetching bills" });
  }
};

// Generate PDF for an existing bill
const getBillPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Billing.findById(id);

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    const pdfBuffer = generatePDF(bill.toObject());
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=bill_${bill.billNo}.pdf`);
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error("Error generating bill PDF:", err);
    res.status(500).json({ error: "Error generating bill PDF" });
  }
};

module.exports = {
  createBill,
  getAllBills,
  getBillPDF
};