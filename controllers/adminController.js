// File: controllers/adminController.js

const { Book, Order, OrderDetail, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// 1. Melihat semua buku (tidak terbatas stok)
exports.getAllBooksForAdmin = async (req, res, next) => {
  try {
    // Admin bisa melihat semua buku, termasuk yang stoknya habis
    const books = await Book.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ books });
  } catch (error) {
    next(error); // Teruskan error ke middleware pusat
  }
};

// 2. Menambah buku baru
exports.addBook = async (req, res, next) => {
  try {
    const { title, author, description, price, stock } = req.body;
    
    // Validasi input
    if (!title || !author || price == null || stock == null) {
        return res.status(400).json({ message: 'Input tidak lengkap. Title, author, price, dan stock wajib diisi.' });
    }

    const newBook = await Book.create({ title, author, description, price, stock });
    res.status(201).json({ message: 'Buku baru berhasil ditambahkan', book: newBook });
  } catch (error) {
    next(error);
  }
};

// 3. Menambah/mengurangi stok buku (DENGAN PERLINDUNGAN RACE CONDITION)
exports.updateStock = async (req, res, next) => {
  // Mulai transaksi
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { change } = req.body; // change bisa positif (menambah) atau negatif (mengurangi)

    if (typeof change !== 'number') {
      await t.rollback();
      return res.status(400).json({ message: 'Nilai "change" harus berupa angka.' });
    }

    // Cari buku dan KUNCI baris data tersebut sampai transaksi selesai (pessimistic lock)
    const book = await Book.findByPk(id, {
      lock: true,
      transaction: t
    });

    if (!book) {
      await t.rollback();
      return res.status(404).json({ message: 'Buku tidak ditemukan' });
    }

    // Kalkulasi stok baru, pastikan tidak negatif
    const newStock = book.stock + change;
    if (newStock < 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Stok tidak boleh kurang dari nol.' });
    }
    
    book.stock = newStock;
    await book.save({ transaction: t });

    // Jika semua berhasil, commit transaksi
    await t.commit();

    res.status(200).json({ message: `Stok buku '${book.title}' berhasil diperbarui`, book });
  } catch (error) {
    // Jika ada error, rollback semua perubahan
    await t.rollback();
    next(error); // Teruskan error ke middleware pusat
  }
};


// 4. Menghapus buku dari katalog
exports.deleteBook = async (req, res, next) => {
    try {
        const { id } = req.params;
        const book = await Book.findByPk(id);
        if (!book) {
            return res.status(404).json({ message: 'Buku tidak ditemukan' });
        }

        await book.destroy();
        res.status(200).json({ message: `Buku '${book.title}' berhasil dihapus.` });

    } catch (error) {
        // Handle jika ada constraint error (misal, buku sudah ada di order detail)
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: 'Gagal menghapus: Buku ini sudah menjadi bagian dari transaksi dan tidak dapat dihapus.' });
        }
        next(error);
    }
};


// 5. Mengecek list transaksi checkout
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User, 
          attributes: ['id', 'name', 'email'] 
        },
        {
          model: OrderDetail,
          include: [{ model: Book, attributes: ['id', 'title'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
};

// 6. Membuat laporan penjualan
exports.getSalesReport = async (req, res, next) => {
    try {
        const salesReport = await Book.findAll({
            attributes: [
                'id',
                'title',
                'stock', // Jumlah stok tersisa
                [
                    sequelize.literal(`(
                        SELECT CAST(COALESCE(SUM("OrderDetail"."quantity"), 0) AS INTEGER)
                        FROM "OrderDetails" AS "OrderDetail"
                        JOIN "Orders" AS "Order" ON "OrderDetail"."OrderId" = "Order"."id"
                        WHERE
                            "OrderDetail"."BookId" = "Book"."id" AND
                            "Order"."status" = 'success'
                    )`),
                    'units_sold'
                ],
                [
                    sequelize.literal(`(
                        SELECT CAST(COALESCE(SUM("OrderDetail"."quantity" * "OrderDetail"."price"), 0) AS INTEGER)
                        FROM "OrderDetails" AS "OrderDetail"
                        JOIN "Orders" AS "Order" ON "OrderDetail"."OrderId" = "Order"."id"
                        WHERE
                            "OrderDetail"."BookId" = "Book"."id" AND
                            "Order"."status" = 'success'
                    )`),
                    'total_revenue'
                ]
            ],
            order: [[sequelize.literal('units_sold'), 'DESC']] // Urutkan dari yang paling banyak terjual
        });

        res.status(200).json({ salesReport });
    } catch (error) {
        next(error);
    }
};