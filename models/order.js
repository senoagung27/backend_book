// File: models/order.js
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Hubungan: Satu Order dimiliki oleh satu User
      Order.belongsTo(models.User, { foreignKey: 'UserId' });
      // Hubungan: Satu Order memiliki banyak OrderDetail
      Order.hasMany(models.OrderDetail, { foreignKey: 'OrderId' });
    }
  }
  Order.init({
    UserId: DataTypes.INTEGER,
    total_price: DataTypes.INTEGER,
    status: {
      type: DataTypes.ENUM('pending', 'success', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};