// File: controllers/cartController.js

const { Cart, Book } = require('../models');

/**
 * Menambahkan buku ke keranjang belanja user.
 * Jika buku sudah ada, maka quantity akan ditambahkan.
 */
exports.addToCart = async (req, res) => {
  const { bookId, quantity } = req.body;
  const userId = req.user.id; // Diambil dari token otentikasi (middleware)

  try {
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Buku tidak ditemukan' });
    }
    if (book.stock < quantity) {
      return res.status(400).json({ message: 'Stok tidak mencukupi' });
    }

    // Cek apakah buku sudah ada di keranjang user
    let cartItem = await Cart.findOne({ where: { UserId: userId, BookId: bookId } });

    if (cartItem) {
      // Jika sudah ada, update quantity
      cartItem.quantity += parseInt(quantity, 10); // Pastikan quantity adalah angka
      await cartItem.save();
    } else {
      // Jika belum ada, buat entri baru
      cartItem = await Cart.create({ UserId: userId, BookId: bookId, quantity });
    }
    res.status(201).json({ message: 'Buku berhasil ditambahkan ke keranjang', data: cartItem });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * Menampilkan semua item yang ada di keranjang user.
 */
exports.viewCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const cartItems = await Cart.findAll({
      where: { UserId: userId },
      // Sertakan detail buku untuk setiap item di keranjang
      include: [{
        model: Book,
        attributes: ['id', 'title', 'author', 'price'] // Hanya ambil atribut yang relevan
      }],
      order: [['createdAt', 'DESC']] // Urutkan berdasarkan yang terbaru ditambahkan
    });

    if (!cartItems || cartItems.length === 0) {
      return res.status(200).json({ message: 'Keranjang Anda kosong', data: [] });
    }

    res.status(200).json({ data: cartItems });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

/**
 * Menghapus satu item buku dari keranjang user.
 */
exports.removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const { bookId } = req.params; // Ambil bookId dari parameter URL, misal: /api/cart/5

  try {
    const cartItem = await Cart.findOne({
      where: {
        UserId: userId,
        BookId: bookId
      }
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Item tidak ditemukan di keranjang' });
    }

    // Hapus item dari database
    await cartItem.destroy();

    res.status(200).json({ message: 'Item berhasil dihapus dari keranjang' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};