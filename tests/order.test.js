const request = require('supertest');
const app = require('../app');
const { sequelize, Book, Cart } = require('../models');
const redisClient = require('../config/redis');

let customerToken;
let book;

beforeAll(async () => {
    await sequelize.sync({ force: true });
    // Buat user
    await request(app).post('/api/auth/register').send({ name: 'Customer Order', email: 'order@example.com', password: 'password' });
    const res = await request(app).post('/api/auth/login').send({ email: 'order@example.com', password: 'password' });
    customerToken = res.body.accessToken;

    // Buat buku
    book = await Book.create({ title: 'Buku Checkout', author: 'Penulis', price: 80000, stock: 5 });
});

afterAll(async () => {
    await sequelize.close();
    await redisClient.quit();
});

describe('Order Endpoints | Rute Checkout', () => {
    it('POST /api/checkout -> Gagal checkout jika keranjang kosong', async () => {
        const res = await request(app)
            .post('/api/checkout')
            .set('Authorization', `Bearer ${customerToken}`);
        
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'Keranjang Anda kosong');
    });

    it('POST /api/checkout -> Sukses checkout jika keranjang ada isi', async () => {
        // 1. Tambah item ke keranjang dulu
        await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ bookId: book.id, quantity: 3 });

        // 2. Lakukan checkout
        const res = await request(app)
            .post('/api/checkout')
            .set('Authorization', `Bearer ${customerToken}`);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'Checkout berhasil');
        expect(res.body.order.total_price).toEqual(240000); // 80000 * 3

        // 3. Verifikasi stok buku berkurang
        const updatedBook = await Book.findByPk(book.id);
        expect(updatedBook.stock).toEqual(2); // 5 - 3 = 2

        // 4. Verifikasi keranjang kosong
        const cartItems = await request(app)
            .get('/api/cart')
            .set('Authorization', `Bearer ${customerToken}`);
        expect(cartItems.body.data.length).toEqual(0);
    });
});