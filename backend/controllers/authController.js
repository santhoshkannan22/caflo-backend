const bcrypt = require('bcryptjs');

const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, preferences } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email already in use.');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      preferences
    });

    return res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        savedCafes: user.savedCafes,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('Invalid credentials.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid credentials.');
      error.statusCode = 401;
      throw error;
    }

    return res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        savedCafes: user.savedCafes,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser
};
