// File: routes/customerRoutes.js

const express = require('express');
const router = express.Router();
const { bookController, cartController, orderController } = require('../controllers');
// --- PERBAIKAN DI SINI ---
// Mengganti 'authentication' menjadi 'authenticate' agar sesuai dengan file middleware
const { authenticate } = require('../middleware/authMiddleware');

// Dokumentasi: Rute-rute ini adalah endpoint yang bisa diakses oleh customer.

// == Rute Buku ==
// Rute ini tidak memerlukan login
router.get('/books', bookController.getAllBooks);
router.get('/books/:id', bookController.getBookById);

// --- PERBAIKAN DI SINI ---
// Semua rute di bawah ini akan menggunakan middleware 'authenticate'
router.use(authenticate);

// == Rute Keranjang (membutuhkan login) ==
// Menambahkan buku ke keranjang
router.post('/cart', cartController.addToCart);
// Melihat isi keranjang
router.get('/cart', cartController.viewCart);
// Menghapus buku dari keranjang
router.delete('/cart/:bookId', cartController.removeFromCart);

// == Rute Checkout (membutuhkan login) ==
// Melakukan checkout
router.post('/checkout', orderController.checkout);

module.exports = router;