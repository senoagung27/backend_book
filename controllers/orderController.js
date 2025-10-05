// File: controllers/orderController.js
const { Order, OrderDetail, Cart, Book, sequelize } = require('../models');

exports.checkout = async (req, res) => {
  const userId = req.user.id;
  const t = await sequelize.transaction(); // Mulai transaksi database

  try {
    const cartItems = await Cart.findAll({ where: { UserId: userId }, include: [Book] });
    if (cartItems.length === 0) return res.status(400).json({ message: 'Keranjang Anda kosong' });

    let totalPrice = 0;
    for (const item of cartItems) {
      // Validasi stok sekali lagi saat checkout
      if (item.Book.stock < item.quantity) {
        throw new Error(`Stok untuk buku '${item.Book.title}' tidak mencukupi.`);
      }
      totalPrice += item.Book.price * item.quantity;
    }

    // 1. Buat entri di tabel Order
    const newOrder = await Order.create({
      UserId: userId,
      total_price: totalPrice,
      status: 'pending' // Status awal
    }, { transaction: t });

    // 2. Pindahkan item dari keranjang ke OrderDetail dan kurangi stok buku
    for (const item of cartItems) {
      await OrderDetail.create({
        OrderId: newOrder.id,
        BookId: item.BookId,
        quantity: item.quantity,
        price: item.Book.price // Simpan harga saat checkout
      }, { transaction: t });

      const book = await Book.findByPk(item.BookId, { transaction: t });
      book.stock -= item.quantity;
      await book.save({ transaction: t });
    }

    // 3. Kosongkan keranjang user
    await Cart.destroy({ where: { UserId: userId }, transaction: t });
    
    // Jika semua proses berhasil, commit transaksi
    await t.commit();

    res.status(201).json({ message: 'Checkout berhasil', order: newOrder });

  } catch (error) {
    // Jika ada satu saja proses yang gagal, batalkan semua perubahan (rollback)
    await t.rollback();
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.paymentCallback = async (req, res) => {
  const { order_id, transaction_status } = req.body; // Body request dari payment gateway

  try {
    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ message: "Order tidak ditemukan" });

    // Update status order berdasarkan callback
    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      order.status = 'success';
    } else if (transaction_status === 'expire' || transaction_status === 'cancel') {
      order.status = 'failed';
      // Logika untuk mengembalikan stok buku bisa ditambahkan di sini
    }
    await order.save();

    res.status(200).json({ message: "Status pembayaran berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};