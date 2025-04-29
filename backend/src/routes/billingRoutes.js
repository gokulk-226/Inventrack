// routes/billingRoutes.js
const express = require("express");
const router = express.Router();
const { createBill, getAllBills } = require("../controllers/BillingController");

router.post("/", createBill);

router.get("/", getAllBills);

module.exports = router;
