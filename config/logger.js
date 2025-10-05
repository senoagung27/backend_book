// File: config/logger.js

// Logger sederhana menggunakan console untuk development
const logger = {
    info: (message) => {
      console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
    },
    error: (message, meta) => {
      console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, meta || '');
    }
  };
  
  module.exports = logger;