'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     */
    await queryInterface.bulkInsert('Books', [
      {
        title: 'Laskar Pelangi',
        author: 'Andrea Hirata',
        description: 'Kisah 10 anak dari keluarga miskin yang bersekolah di sebuah sekolah Muhammadiyah di Belitung.',
        price: 75000,
        stock: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Bumi Manusia',
        author: 'Pramoedya Ananta Toer',
        description: 'Bagian pertama dari Tetralogi Buru yang menceritakan kisah Minke di era Hindia Belanda.',
        price: 95000,
        stock: 10,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Negeri 5 Menara',
        author: 'Ahmad Fuadi',
        description: 'Kisah enam santri dari berbagai daerah yang bertemu di Pondok Madani.',
        price: 65000,
        stock: 20,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Cantik Itu Luka',
        author: 'Eka Kurniawan',
        description: 'Sebuah novel epik yang memadukan sejarah, mitos, dan kisah keluarga.',
        price: 88000,
        stock: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Pulang',
        author: 'Tere Liye',
        description: 'Kisah seorang bujang yang pergi merantau dan belajar tentang kehidupan.',
        price: 80000,
        stock: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Perahu Kertas',
        author: 'Dee Lestari',
        description: 'Kisah cinta antara Kugy dan Keenan yang penuh lika-liku dan impian.',
        price: 70000,
        stock: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Ayat-Ayat Cinta',
        author: 'Habiburrahman El Shirazy',
        description: 'Novel roman Islami yang berlatar di Kairo, Mesir.',
        price: 60000,
        stock: 30,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Sang Pemimpi',
        author: 'Andrea Hirata',
        description: 'Sekuel dari Laskar Pelangi yang menceritakan mimpi Ikal dan Arai untuk sekolah di Paris.',
        price: 72000,
        stock: 18,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Supernova: Ksatria, Puteri, dan Bintang Jatuh',
        author: 'Dee Lestari',
        description: 'Novel fiksi ilmiah yang memadukan sains, spiritualitas, dan cinta.',
        price: 99000,
        stock: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Filosofi Kopi',
        author: 'Dee Lestari',
        description: 'Kumpulan cerita dan prosa tentang pencarian makna melalui kopi.',
        price: 55000,
        stock: 22,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     */
    await queryInterface.bulkDelete('Books', null, {});
  }
};