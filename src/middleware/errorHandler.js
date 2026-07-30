const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

const handlePrismaError = (err) => {
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'Field';
    return new AppError(`Duplicate value for ${field}. Please use another value.`, 400);
  }
  if (err.code === 'P2025') {
    return new AppError('Record not found.', 404);
  }
  return new AppError('Database Error', 500);
};

const sendErrorDev = (err, req, res) => {
  logger.error('API', err.message, { error: err.stack, path: req.originalUrl });
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    logger.error('API', err.message, { path: req.originalUrl });
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    logger.error('API', 'Programming Error', { error: err.stack, path: req.originalUrl });
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = Object.create(err);
    error.message = err.message;
    
    // Check if error is from Prisma
    if (error.code && error.code.startsWith('P')) {
      error = handlePrismaError(error);
    }
    
    // Check if error is from Zod validation
    if (error.name === 'ZodError') {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      error = new AppError(`Validation Error: ${messages.join(', ')}`, 400);
    }

    sendErrorProd(error, req, res);
  }
};
