// File: controllers/index.js

const bookController = require('./bookController');
const cartController = require('./cartController');
const orderController = require('./orderController');
const authController = require('./authController');
const adminController = require('./adminController'); // <-- TAMBAHKAN BARIS INI

// Dokumentasi: File ini menggabungkan semua controller menjadi satu modul
// agar mudah diimpor dari file lain (seperti file routes).
module.exports = {
  bookController,
  cartController,
  orderController,
  authController,
  adminController, // <-- TAMBAHKAN BARIS INI
};