const express = require('express');
const router = express.Router();
const { addPurchase, getPurchases, deletePurchase } = require('../controllers/purchaseController');

router.post('/add', addPurchase);
router.get('/', getPurchases);
router.delete('/:id', deletePurchase);

module.exports = router;
