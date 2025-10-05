const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');
const redisClient = require('../config/redis');

let adminToken;
let bookId;

// Setup: Jalankan sebelum semua tes di file ini
beforeAll(async () => {
  // Bersihkan data
  await sequelize.sync({ force: true });

  // Buat user admin
  await request(app).post('/api/auth/register').send({ name: 'Admin User', email: 'admin@example.com', password: 'adminpass', role: 'admin' });
  
  // Login sebagai admin untuk mendapatkan token
  const res = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'adminpass' });
  adminToken = res.body.accessToken;
});

// Hentikan koneksi setelah semua tes selesai
afterAll(async () => {
  await sequelize.close();
  await redisClient.quit();
});

describe('Admin Endpoints | Rute Khusus Admin', () => {

  // Test Case: Manajemen Buku
  describe('Book Management', () => {
    it('POST /api/admin/books -> Admin harus bisa menambah buku baru', async () => {
      const res = await request(app)
        .post('/api/admin/books')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Buku Admin', author: 'Admin', price: 150000, stock: 20 });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.book).toHaveProperty('title', 'Buku Admin');
      bookId = res.body.book.id; // Simpan ID buku untuk tes selanjutnya
    });

    it('GET /api/admin/books -> Admin harus bisa melihat semua buku', async () => {
        const res = await request(app)
          .get('/api/admin/books')
          .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.books)).toBe(true);
        expect(res.body.books.length).toBeGreaterThan(0);
    });

    it('PATCH /api/admin/books/:id/stock -> Admin harus bisa mengubah stok buku', async () => {
      const res = await request(app)
        .patch(`/api/admin/books/${bookId}/stock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ change: -5 }); // Mengurangi stok sebanyak 5
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.book).toHaveProperty('stock', 15); // Stok awal 20 - 5 = 15
    });

    it('DELETE /api/admin/books/:id -> Admin harus bisa menghapus buku', async () => {
      const res = await request(app)
        .delete(`/api/admin/books/${bookId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', `Buku 'Buku Admin' berhasil dihapus.`);
    });
  });

  // Test Case: Manajemen Order
  describe('Order Management', () => {
    it('GET /api/admin/orders -> Admin harus bisa melihat semua transaksi', async () => {
        // Kita perlu membuat order terlebih dahulu untuk dites
        // (Ini akan terjadi secara otomatis saat menjalankan tes order)
        const res = await request(app)
          .get('/api/admin/orders')
          .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.orders)).toBe(true);
    });
  });

   // Test Case: Laporan
   describe('Sales Report', () => {
    it('GET /api/admin/reports/sales -> Admin harus bisa mendapatkan laporan penjualan', async () => {
        const res = await request(app)
          .get('/api/admin/reports/sales')
          .set('Authorization', `Bearer ${adminToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body.salesReport)).toBe(true);
    });
  });
});