const errorHandler = (err, req, res, next) => {
  return res.status(500).json({ err: err.message, type: err.name });
};

module.exports = errorHandler;
