# Bookstore API

Selamat datang di Bookstore API! Ini adalah aplikasi backend RESTful yang dirancang untuk mengelola operasi toko buku online. Aplikasi ini dibangun dengan Node.js, Express, dan Sequelize, serta dilengkapi dengan fungsionalitas untuk customer dan admin.

Aplikasi ini juga di-container-isasi menggunakan Docker untuk memastikan proses development dan deployment yang konsisten dan mudah.

## 🌟 Fitur Utama

-   **Autentikasi & Otorisasi**: Sistem registrasi, login, dan logout yang aman menggunakan JSON Web Tokens (JWT). Terdapat juga pembatasan sesi untuk memastikan user hanya bisa login dari satu perangkat pada satu waktu.
-   **Manajemen User**:
    -   Role-based access control (Customer & Admin).
    -   Endpoint profil untuk melihat data user yang sedang login.
-   **Katalog Buku (Publik)**:
    -   Melihat daftar semua buku yang tersedia (stok > 0).
    -   Melihat detail spesifik dari satu buku.
-   **Keranjang Belanja (Customer)**:
    -   Menambah/memperbarui item di keranjang.
    -   Melihat isi keranjang.
    -   Menghapus item dari keranjang.
-   **Sistem Transaksi (Customer)**:
    -   Proses checkout untuk memindahkan item dari keranjang ke pesanan.
    -   Update status pembayaran melalui *callback* dari payment gateway.
-   **Panel Admin**:
    -   Manajemen penuh atas buku (tambah, hapus, update stok).
    -   Melihat semua transaksi yang masuk dari customer.
    -   Menghasilkan laporan penjualan untuk analisis bisnis.
-   **Keamanan**:
    -   *Rate limiting* untuk mencegah serangan brute-force, terutama pada endpoint login.
    -   Validasi input untuk memastikan integritas data.

## 🛠️ Teknologi yang Digunakan

-   **Backend**: Node.js, Express.js
-   **Database**: PostgreSQL
-   **ORM**: Sequelize
-   **In-Memory Store**: Redis (untuk rate limiting dan manajemen sesi)
-   **Containerization**: Docker, Docker Compose
-   **Testing**: Jest, Supertest

## 🚀 Panduan Instalasi

Anda dapat menjalankan aplikasi ini dengan dua cara: menggunakan Docker (direkomendasikan untuk kemudahan) atau secara manual di lingkungan lokal.

### 1. Instalasi dengan Docker (Direkomendasikan)

Metode ini adalah cara termudah untuk menjalankan aplikasi beserta database (PostgreSQL) dan Redis tanpa perlu menginstalnya secara manual di sistem Anda.

**Prasyarat:**
* Docker sudah terinstal di komputer Anda.
* Docker Compose sudah terinstal.

**Langkah-langkah:**

1.  **Clone Repository**
    ```bash
    git clone <URL_REPOSITORY_ANDA>
    cd <NAMA_FOLDER_REPOSITORY>
    ```

2.  **Buat File `.env`**
    Buat file bernama `.env` di root direktori proyek, lalu salin dan sesuaikan variabel dari contoh di bawah ini. File ini berisi konfigurasi untuk database, JWT, dan Redis.

    ```env
    # Konfigurasi Aplikasi
    PORT=3000
    NODE_ENV=development

    # Konfigurasi Database (sesuaikan dengan docker-compose.yaml)
    DB_USER=bookstore_user
    DB_PASSWORD=your_strong_password
    DB_NAME=bookstore_db
    DB_HOST=db

    # Konfigurasi Redis (sesuaikan dengan docker-compose.yaml)
    REDIS_URL=redis://redis:6379

    # Konfigurasi JSON Web Token (JWT)
    JWT_SECRET=rahasia_super_aman_dan_panjang
    JWT_EXPIRES_IN=1h
    JWT_EXPIRES_IN_SECONDS=3600
    ```

3.  **Jalankan dengan Docker Compose**
    Buka terminal Anda di root direktori proyek dan jalankan perintah berikut:

    ```bash
    docker-compose up --build -d
    ```
    -   `--build`: Perintah ini akan membangun image Docker untuk aplikasi Anda berdasarkan `Dockerfile`.
    -   `-d` (detached mode): Perintah ini akan menjalankan semua container (aplikasi, database, Redis) di background.

4.  **Selesai!**
    Aplikasi Anda sekarang berjalan. API dapat diakses di `http://localhost:3000`.

### 2. Instalasi Lokal (Manual)

Gunakan metode ini jika Anda tidak ingin menggunakan Docker dan lebih memilih untuk mengelola dependensi secara manual.

**Prasyarat:**
* Node.js (versi 18 atau lebih tinggi)
* NPM
* PostgreSQL server sedang berjalan
* Redis server sedang berjalan

**Langkah-langkah:**

1.  **Clone Repository**
    ```bash
    git clone <URL_REPOSITORY_ANDA>
    cd <NAMA_FOLDER_REPOSITORY>
    ```

2.  **Install Dependensi**
    Jalankan perintah berikut untuk menginstal semua package yang dibutuhkan dari `package.json`.
    ```bash
    npm install
    ```

3.  **Konfigurasi Database**
    Pastikan server PostgreSQL Anda berjalan. Buat database baru dan user sesuai dengan yang akan Anda konfigurasikan di file `.env`.

4.  **Buat File `.env`**
    Buat file `.env` dan isi dengan konfigurasi yang sesuai untuk lingkungan lokal Anda. **Penting**: Ubah `DB_HOST` dan `REDIS_URL` ke `localhost` atau alamat IP server Anda.

    ```env
    # Konfigurasi Aplikasi
    PORT=3000
    NODE_ENV=development

    # Konfigurasi Database Lokal
    DB_USER=<user_db_anda>
    DB_PASSWORD=<password_db_anda>
    DB_NAME=<nama_db_anda>
    DB_HOST=localhost

    # Konfigurasi Redis Lokal
    REDIS_URL=redis://localhost:6379

    # Konfigurasi JSON Web Token (JWT)
    JWT_SECRET=rahasia_super_aman_dan_panjang
    JWT_EXPIRES_IN=1h
    JWT_EXPIRES_IN_SECONDS=3600
    ```

5.  **Jalankan Aplikasi**
    Gunakan perintah ini untuk memulai server dalam mode development dengan `nodemon`. Server akan otomatis restart setiap kali ada perubahan pada file.

    ```bash
    npm run dev
    ```

6.  **Selesai!**
    API sekarang dapat diakses di `http://localhost:3000`.