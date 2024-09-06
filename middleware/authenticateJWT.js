// middleware/authenticateJWT.js
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT and set req.user
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Extract the token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      req.user = user; // Set user in the request object
      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = authenticateJWT;
