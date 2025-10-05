// File: routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const { orderController } = require('../controllers');

// Dokumentasi: Rute ini akan dipanggil oleh sistem pembayaran eksternal (payment gateway).
router.post('/callback', orderController.paymentCallback);

module.exports = router;