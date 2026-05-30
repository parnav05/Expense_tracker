const jwt = require('jsonwebtoken');
const { User, Category } = require('../models');
const logger = require('../utils/logger');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍽️', color: '#f59e0b', is_default: true },
  { name: 'Transport', icon: '🚗', color: '#3b82f6', is_default: true },
  { name: 'Shopping', icon: '🛍️', color: '#ec4899', is_default: true },
  { name: 'Entertainment', icon: '🎬', color: '#8b5cf6', is_default: true },
  { name: 'Health', icon: '💊', color: '#ef4444', is_default: true },
  { name: 'Utilities', icon: '💡', color: '#10b981', is_default: true },
  { name: 'Education', icon: '📚', color: '#06b6d4', is_default: true },
  { name: 'Salary', icon: '💰', color: '#22c55e', is_default: true },
  { name: 'Other', icon: '📦', color: '#6b7280', is_default: true },
];

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, currency } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, currency: currency || 'INR' });

    // Create default categories for the new user
    const categories = DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: user.id }));
    await Category.bulkCreate(categories);

    const token = generateToken(user.id);
    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account deactivated.' });
    }

    const token = generateToken(user.id);
    logger.info(`User logged in: ${email}`);

    res.json({
      success: true,
      message: 'Login successful!',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, currency } = req.body;
    await req.user.update({ name, currency });
    res.json({ success: true, message: 'Profile updated.', data: { user: req.user } });
  } catch (error) {
    next(error);
  }
};
