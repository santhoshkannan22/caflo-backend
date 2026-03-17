const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Not authorized: token missing.');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.userId).select('-password');
    if (!req.user) {
      const error = new Error('Not authorized: user not found.');
      error.statusCode = 401;
      throw error;
    }

    next();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.message = 'Not authorized: invalid token.';
    }
    next(error);
  }
};

module.exports = { protect };
