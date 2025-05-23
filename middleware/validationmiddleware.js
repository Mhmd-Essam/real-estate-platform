// validate.js (middleware)
const Joi = require('joi');

function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        details: error.details.map((detail) => ({
          message: detail.message,
          path: detail.path,
        })),
      });
    }
    next();
  };
}

module.exports = validate;
