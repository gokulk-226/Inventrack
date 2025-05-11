const express = require('express');
const router = express.Router();
const {
  createBill,
  getAllBills,
  getBillPDF
} = require('../controllers/BillingController');

// Create new bill
router.post('/', createBill);

// Get all bills
router.get('/', getAllBills);

// Get PDF for specific bill
router.get('/:id/pdf', getBillPDF);

module.exports = router;