const Joi = require('joi');

// Skema untuk menambah buku baru
const addBookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  price: Joi.number().integer().min(0).required(),
  stock: Joi.number().integer().min(0).required()
});

// Skema untuk update stok
const updateStockSchema = Joi.object({
  change: Joi.number().integer().invalid(0).required()
});

module.exports = {
  addBookSchema,
  updateStockSchema
};