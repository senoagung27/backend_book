const request = require('supertest');
const app = require('../app');
const { sequelize, Book } = require('../models');

let bookInStock, bookOutOfStock;

beforeAll(async () => {
    await sequelize.sync({ force: true });
    bookInStock = await Book.create({ title: 'Buku Tersedia', author: 'Penulis', price: 50000, stock: 10 });
    bookOutOfStock = await Book.create({ title: 'Buku Habis', author: 'Penulis', price: 75000, stock: 0 });
});

afterAll(async () => {
    await sequelize.close();
});

describe('Public Book Endpoints | Rute Publik Buku', () => {
    it('GET /api/books -> Harus mengembalikan semua buku yang stoknya > 0', async () => {
        const res = await request(app).get('/api/books');

        expect(res.statusCode).toEqual(200);
        expect(res.body.books.length).toEqual(1);
        expect(res.body.books[0].title).toEqual('Buku Tersedia');
    });

    it('GET /api/books/:id -> Harus mengembalikan detail satu buku yang stoknya > 0', async () => {
        const res = await request(app).get(`/api/books/${bookInStock.id}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body.book.title).toEqual('Buku Tersedia');
    });

    it('GET /api/books/:id -> Harus mengembalikan 404 jika buku stoknya habis', async () => {
        const res = await request(app).get(`/api/books/${bookOutOfStock.id}`);
        expect(res.statusCode).toEqual(404);
    });
});