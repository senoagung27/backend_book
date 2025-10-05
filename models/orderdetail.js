// File: models/orderdetail.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    static associate(models) {
      // Hubungan: OrderDetail adalah bagian dari satu Order
      OrderDetail.belongsTo(models.Order, { foreignKey: 'OrderId' });
      // Hubungan: OrderDetail merujuk ke satu Book
      OrderDetail.belongsTo(models.Book, { foreignKey: 'BookId' });
    }
  }
  OrderDetail.init({
    OrderId: DataTypes.INTEGER,
    BookId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'OrderDetail',
  });
  return OrderDetail;
};