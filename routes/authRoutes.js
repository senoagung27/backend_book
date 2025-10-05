const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validationMiddleware = require('../middleware/validationMiddleware');
const { registerSchema, loginSchema } = require('../validators/authValidator');
const { authenticate } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter'); // Impor rate limiter untuk login

// Rute untuk registrasi user baru
router.post('/register', validationMiddleware(registerSchema), authController.register);

// Rute untuk login, dilindungi oleh rate limiter yang lebih ketat
router.post('/login', loginLimiter, validationMiddleware(loginSchema), authController.login);

// Rute untuk logout, membutuhkan user untuk login terlebih dahulu
router.post('/logout', authenticate, authController.logout);

module.exports = router;