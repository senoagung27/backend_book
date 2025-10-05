const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { v4: uuidv4 } = require('uuid'); // Untuk membuat ID unik
const redisClient = require('../config/redis'); // Klien koneksi Redis

/**
 * Fungsi untuk Registrasi User Baru
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'customer',
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    next(error); // Teruskan error ke error handler pusat
  }
};

/**
 * Fungsi untuk Login User (dengan Single Device Session)
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // --- IMPLEMENTASI SINGLE DEVICE SESSION ---
    const tokenId = uuidv4(); // 1. Buat ID unik untuk sesi ini
    const userSessionKey = `session:${user.id}`;

    // 2. Simpan tokenId ke Redis, set kedaluwarsa sesuai masa aktif token (misal: 1 jam)
    await redisClient.set(userSessionKey, tokenId, {
      EX: parseInt(process.env.JWT_EXPIRES_IN_SECONDS, 10) || 3600
    });
    // --- SELESAI ---

    // 3. Tambahkan tokenId (tid) ke dalam payload JWT
    const accessToken = jwt.sign(
      { id: user.id, role: user.role, tid: tokenId }, // Menambahkan 'tid'
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fungsi untuk Logout User
 */
exports.logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userSessionKey = `session:${userId}`;

    // Hapus sesi dari Redis untuk membatalkan token yang aktif
    await redisClient.del(userSessionKey);

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};