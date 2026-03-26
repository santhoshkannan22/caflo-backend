const bcrypt = require('bcryptjs');

const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, preferences, profileImage } = req.body;

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
      profileImage,
      preferences
    });

    return res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
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
        profileImage: user.profileImage,
        preferences: user.preferences,
        savedCafes: user.savedCafes,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.profileImage !== undefined) user.profileImage = req.body.profileImage;

    const updatedUser = await user.save();

    return res.status(200).json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage,
      preferences: updatedUser.preferences,
      savedCafes: updatedUser.savedCafes,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateProfile
};
