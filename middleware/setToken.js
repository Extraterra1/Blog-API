const setToken = (req, res, next) => {
  // Verify token
  // Token format is "Bearer <token>"
  // Get auth header
  const bearerHeader = req.headers.authorization;

  // Check if bearer is undefined
  if (typeof bearerHeader === 'undefined') return res.status(403).json({ err: 'Missing Auth Header' });

  // Get token from string
  const bearerToken = bearerHeader.split(' ')[1];

  // Set the token
  req.token = bearerToken;
  next();
};

module.exports = setToken;
