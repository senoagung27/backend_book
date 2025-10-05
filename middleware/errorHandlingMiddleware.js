// File: middleware/errorHandlingMiddleware.js
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Log error menggunakan Winston
  logger.error(err.message, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'Guest'
  });

  // Pesan yang dikirim ke client
  const responseMessage = (process.env.NODE_ENV === 'production' && statusCode === 500)
    ? 'Terjadi kesalahan pada server.'
    : err.message;
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: responseMessage
  });
};

module.exports = errorHandler;