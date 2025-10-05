// File: app.js
require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const redisClient = require('./config/redis');
const errorHandler = require('./middleware/errorHandlingMiddleware');
// --- 1. Impor database ---
const db = require('./models');

const app = express();
const port = process.env.PORT || 3000;

// Import semua rute
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const customerRoutes = require('./routes/customerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// == MIDDLEWARE RATE LIMITING DENGAN REDIS ==
const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Terlalu banyak request dari IP ini, silakan coba lagi setelah 15 menit.'
});

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Selamat datang di Bookstore API!');
});

// Menggunakan rute-rute
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', customerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

// --- 2. Fungsi untuk memulai server ---
const startServer = async () => {
  try {
    // Sinkronkan semua model dengan database
    // { force: true } akan menghapus tabel lama dan membuat yang baru (cocok untuk development)
    await db.sequelize.sync({ force: true });
    console.log('Database berhasil disinkronkan.');

    app.listen(port, () => {
      console.log(`Server berjalan di http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Gagal menyinkronkan database:', error);
  }
};

// --- 3. Jalankan server ---
startServer();

module.exports = app;