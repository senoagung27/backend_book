const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('../config/redis');

// Rate limiter yang lebih ketat khusus untuk endpoint sensitif seperti login
const loginLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // Hanya izinkan 5 percobaan login dari 1 IP dalam 15 menit
  message: {
    status: 'error',
    message: 'Terlalu banyak percobaan login. Akun Anda ditangguhkan sementara.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter };