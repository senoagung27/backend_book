const jwt = require('jsonwebtoken');
const { User } = require('../models');
const redisClient = require('../config/redis'); // Klien koneksi Redis

/**
 * Middleware untuk memverifikasi token JWT dan sesi di Redis
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication Failed: Token tidak ditemukan atau format salah' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // --- VERIFIKASI SESI DARI REDIS ---
    const userSessionKey = `session:${decoded.id}`;
    const activeTokenId = await redisClient.get(userSessionKey);
    
    // Jika tidak ada sesi di Redis atau tokenId dari JWT tidak cocok, maka sesi tidak valid
    if (!activeTokenId || activeTokenId !== decoded.tid) {
      return res.status(401).json({ message: 'Authentication Failed: Sesi ini sudah tidak aktif, silakan login kembali' });
    }
    // --- SELESAI ---

    // Ambil data user dari database (tanpa menyertakan password)
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'active_token'] } // Hapus kolom password & active_token
    });

    if (!user) {
      return res.status(401).json({ message: 'Authentication Failed: User tidak ditemukan' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Authentication Failed: Token tidak valid atau kedaluwarsa', error: error.message });
    }
    // Teruskan error lainnya ke middleware error handling pusat
    next(error);
  }
};

/**
 * Middleware untuk memeriksa apakah user memiliki role 'admin'
 */
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Anda tidak memiliki akses untuk sumber daya ini' });
  }
};

module.exports = { authenticate, authorizeAdmin };