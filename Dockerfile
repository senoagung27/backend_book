# ---- Stage 1: Build ----
# Menggunakan Node versi 18 sebagai dasar
FROM node:18-alpine AS builder

# Set direktori kerja di dalam container
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install semua dependencies
RUN npm install

# Salin sisa kode aplikasi
COPY . .

# ---- Stage 2: Production ----
# Menggunakan image yang lebih ringan untuk production
FROM node:18-alpine3.19

WORKDIR /usr/src/app

# Salin dependencies dari stage 'builder'
COPY --from=builder /usr/src/app/node_modules ./node_modules
# Salin kode aplikasi dari stage 'builder'
COPY --from=builder /usr/src/app .

# Buka port 3000 agar bisa diakses dari luar container
EXPOSE 3000

# Perintah untuk menjalankan aplikasi saat container dimulai
CMD ["node", "app.js"]