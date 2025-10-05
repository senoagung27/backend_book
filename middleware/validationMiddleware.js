const validationMiddleware = (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      if (error) {
        // Ambil pesan error pertama
        const errorMessage = error.details[0].message;
        return res.status(400).json({
          status: 'error',
          message: `Input tidak valid: ${errorMessage}`
        });
      }
      next();
    };
  };
  
  module.exports = validationMiddleware;