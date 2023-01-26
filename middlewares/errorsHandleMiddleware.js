const errorHandleMiddleware = (err, req, res, next) => {
  console.log(res.status);
  // const statusCode = res.status ? req.status : 500;
  // res.status(res.status);
  res.status(res.status).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
};

export default errorHandleMiddleware;
