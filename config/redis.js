// File: config/redis.js
const redis = require('redis');
const logger = require('./logger'); // Kita akan buat logger sederhana nanti

// Ambil URL Redis dari environment variable, jika tidak ada, gunakan default localhost
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = redis.createClient({
  url: redisUrl
});

redisClient.on('connect', () => {
  logger.info('Berhasil terhubung ke Redis.');
});

redisClient.on('error', (err) => {
  // Log error dengan lebih deskriptif
  logger.error('Redis Client Error', { 
    code: err.code,
    service: 'bookstore-api', 
    stack: err.stack 
  });
});

// Mulai koneksi
redisClient.connect();

module.exports = redisClient;