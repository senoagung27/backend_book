const request = require('supertest');
const app = require('../app');
const { sequelize, Book } = require('../models');
const redisClient = require('../config/redis');

let customerToken;
let book;

beforeAll(async () => {
    await sequelize.sync({ force: true });
    // Buat user customer
    await request(app).post('/api/auth/register').send({ name: 'Customer Cart', email: 'cart@example.com', password: 'password' });
    const res = await request(app).post('/api/auth/login').send({ email: 'cart@example.com', password: 'password' });
    customerToken = res.body.accessToken;

    // Buat buku untuk dimasukkan ke keranjang
    book = await Book.create({ title: 'Buku Keranjang', author: 'Penulis', price: 100000, stock: 25 });
});

afterAll(async () => {
    await sequelize.close();
    await redisClient.quit();
});


describe('Cart Endpoints | Rute Keranjang Belanja', () => {
    it('POST /api/cart -> Harus bisa menambah buku ke keranjang', async () => {
        const res = await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ bookId: book.id, quantity: 2 });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body.data).toHaveProperty('quantity', 2);
    });

    it('POST /api/cart -> Menambah buku yang sama harusnya mengupdate quantity', async () => {
        const res = await request(app)
            .post('/api/cart')
            .set('Authorization', `Bearer ${customerToken}`)
            .send({ bookId: book.id, quantity: 1 });
        
        expect(res.statusCode).toEqual(201);
        expect(res.body.data).toHaveProperty('quantity', 3); // 2 + 1 = 3
    });

    it('GET /api/cart -> Harus bisa melihat isi keranjang', async () => {
        const res = await request(app)
            .get('/api/cart')
            .set('Authorization', `Bearer ${customerToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.length).toEqual(1);
        expect(res.body.data[0].Book.title).toEqual('Buku Keranjang');
    });

    it('DELETE /api/cart/:bookId -> Harus bisa menghapus buku dari keranjang', async () => {
        const res = await request(app)
            .delete(`/api/cart/${book.id}`)
            .set('Authorization', `Bearer ${customerToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'Item berhasil dihapus dari keranjang');
    });
});