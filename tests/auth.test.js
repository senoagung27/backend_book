const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');
const redisClient = require('../config/redis');

// Hentikan semua koneksi setelah tes selesai
afterAll(async () => {
    await sequelize.close();
    await redisClient.quit();
  });

describe('Auth Endpoints | Rute Autentikasi', () => {
  
  // Bersihkan database sebelum setiap tes
  beforeEach(async () => {
    await sequelize.models.User.destroy({ where: {}, truncate: true, cascade: true });
    await redisClient.flushDb(); // <-- TAMBAHKAN BARIS INI
  });

  // Test Case: Registrasi
  describe('POST /api/auth/register', () => {
    it('Harus bisa mendaftarkan user baru dengan sukses', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
    });

    it('Harus gagal mendaftar dengan email yang sudah ada', async () => {
      // Buat user pertama
      await request(app).post('/api/auth/register').send({ name: 'Test User', email: 'duplicate@example.com', password: 'password123' });
      
      // Coba daftar lagi
      const res = await request(app).post('/api/auth/register').send({ name: 'Another User', email: 'duplicate@example.com', password: 'password456' });

      expect(res.statusCode).not.toEqual(201);
    });
  });

  // Test Case: Login
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Buat user untuk login
      await request(app).post('/api/auth/register').send({ name: 'Login User', email: 'login@example.com', password: 'password123' });
    });

    it('Harus bisa login dengan kredensial yang valid dan mendapatkan token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('accessToken');
    });

    it('Harus gagal login dengan password yang salah', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
    });
  });
  
  // Test Case: Logout
  describe('POST /api/auth/logout', () => {
    it('Harus bisa logout dan membatalkan token sesi', async () => {
      // Daftar dan login untuk mendapatkan token
      await request(app).post('/api/auth/register').send({ name: 'Logout User', email: 'logout@example.com', password: 'password123' });
      const loginRes = await request(app).post('/api/auth/login').send({ email: 'logout@example.com', password: 'password123' });
      const token = loginRes.body.accessToken;

      // Lakukan logout
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      
      expect(logoutRes.statusCode).toEqual(200);
      expect(logoutRes.body).toHaveProperty('message', 'Logout successful');

      // Coba akses rute terproteksi dengan token yang sudah di-logout
      const profileRes = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);
        
      expect(profileRes.statusCode).toEqual(401); // Harusnya gagal
    });
  });
});