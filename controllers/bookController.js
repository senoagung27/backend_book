// File: controllers/bookController.js
const { Book } = require('../models');
const { Op } = require('sequelize');

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({ where: { stock: { [Op.gt]: 0 } } });
    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// IMPLEMENTASI FUNGSI getBookById
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findOne({
      where: {
        id,
        stock: { [Op.gt]: 0 } // Hanya tampilkan jika stok masih ada
      }
    });

    if (!book) {
      return res.status(404).json({ message: 'Buku tidak ditemukan atau stok habis' });
    }
    res.status(200).json({ book });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};