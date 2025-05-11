const Billing = require("../models/Billing");
const { jsPDF } = require("jspdf");

// Utility to format date to dd-mm-yyyy (Indian format)
const formatDate = (date) => {
  if (!date) return '';
  
  // Handle both Date objects and ISO strings
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

// Generate PDF using jsPDF (date only)
const generatePDF = (billData) => {
  const doc = new jsPDF();
  const { customerName, mobile, items, grandTotal, date } = billData;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("KPS SILKS", 20, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("415 Uthukuli Road,", 20, 28);
  doc.text("Kunnnathur, Tamil Nadu - 638103", 20, 33);

  // Date display (formatted without time)
  doc.setFontSize(12);
  doc.text(`Date: ${formatDate(date)}`, 150, 20, { align: "right" });

  // Customer info
  doc.text(`Customer Name : ${customerName}`, 20, 45);
  doc.text(`Mobile Number : +91 ${mobile}`, 20, 50);

  // Items list
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

  // Footer
  doc.text("-------------------------------------------------------------", 20, y);
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total: Rs. ${calculatedTotal.toFixed(2)}`, 20, y + 10);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your purchase!", 20, y + 20);

  return doc.output("arraybuffer");
};

// Create bill with date-only storage
const createBill = async (req, res) => {
  try {
    const { customerName, mobile, items } = req.body;

    if (!customerName || !mobile || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Customer details and at least one item are required." });
    }

    // Process items and calculate total
    const processedItems = items.map(item => ({
      ...item,
      totalPrice: item.price * item.quantity
    }));

    const grandTotal = processedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Create new bill with current date (time portion will be 00:00:00)
    const newBill = new Billing({
      customerName,
      mobile,
      items: processedItems,
      grandTotal,
      date: new Date(new Date().setHours(0, 0, 0, 0)) // Normalize to date-only
    });

    const savedBill = await newBill.save();
    const pdfBuffer = generatePDF(savedBill.toObject());

    res.status(201).json({
      message: "Bill created successfully",
      bill: {
        ...savedBill.toObject(),
        date: formatDate(savedBill.date) // Return formatted date in response
      },
      pdf: pdfBuffer.toString("base64")
    });
  } catch (err) {
    console.error("Error creating bill:", err);
    res.status(500).json({ error: "Error creating bill" });
  }
};

// Get all bills with formatted dates
const getAllBills = async (req, res) => {
  try {
    const bills = await Billing.find().sort({ date: -1 });
    
    // Format dates before sending response
    const formattedBills = bills.map(bill => ({
      ...bill.toObject(),
      date: formatDate(bill.date)
    }));
    
    res.status(200).json(formattedBills);
  } catch (err) {
    console.error("Error fetching bills:", err);
    res.status(500).json({ error: "Error fetching bills" });
  }
};

// Get PDF for existing bill
const getBillPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Billing.findById(id);

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    const pdfBuffer = generatePDF({
      ...bill.toObject(),
      date: formatDate(bill.date)
    });
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=bill_${bill._id}.pdf`);
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