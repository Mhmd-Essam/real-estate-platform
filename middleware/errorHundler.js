
const notfound = async (req, res, next) => {
    const error = new Error(`Not found: ${req.originalUrl}`);
    res.status(404);
    next(error);
  };

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};


module.exports = {errorHandler,notfound}; 

