const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

// Rute ini bisa diakses oleh semua user yang sudah login (customer dan admin)
router.get('/profile', authenticate, (req, res) => {
  res.status(200).json({
    message: 'Welcome to your profile!',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// Rute ini HANYA bisa diakses oleh admin
router.get('/admin/dashboard', authenticate, authorizeAdmin, (req, res) => {
    res.status(200).json({
        message: 'Welcome to the Admin Dashboard!',
    });
});

module.exports = router;