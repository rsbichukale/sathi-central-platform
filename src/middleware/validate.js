const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      next(error); // Passes to global errorHandler
    } else {
      next(error);
    }
  }
};

module.exports = validate;
