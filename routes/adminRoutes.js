// File: routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');
const { addBookSchema, updateStockSchema } = require('../validators/bookValidator');

// Middleware ini akan diterapkan ke semua rute di bawahnya
// Memastikan hanya admin yang terautentikasi yang bisa mengakses
router.use(authenticate);
router.use(authorizeAdmin);


// == Rute Manajemen Buku oleh Admin ==

// 1. Melihat semua buku (termasuk yang stoknya 0)
router.get('/books', adminController.getAllBooksForAdmin);

// 2. Menambah buku baru - dengan validasi
router.post('/books', validationMiddleware(addBookSchema), adminController.addBook);

// 3. Mengubah stok buku - dengan validasi
router.patch('/books/:id/stock', validationMiddleware(updateStockSchema), adminController.updateStock);

// 4. Menghapus buku
router.delete('/books/:id', adminController.deleteBook);


// == Rute Manajemen Transaksi oleh Admin ==

// 5. Melihat semua transaksi checkout
router.get('/orders', adminController.getAllOrders);


// == Rute Laporan Penjualan oleh Admin ==

// 6. Mendapatkan laporan penjualan
router.get('/reports/sales', adminController.getSalesReport);


module.exports = router;