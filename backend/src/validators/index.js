const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const registerValidator = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  handleValidation,
];

const loginValidator = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  handleValidation,
];

const expenseValidator = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title required (max 200 chars)'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('date').isDate().withMessage('Valid date required (YYYY-MM-DD)'),
  body('category_id').isInt({ min: 1 }).withMessage('Valid category required'),
  body('type').optional().isIn(['expense', 'income']).withMessage('Type must be expense or income'),
  body('payment_method')
    .optional()
    .isIn(['cash', 'card', 'upi', 'netbanking', 'other'])
    .withMessage('Invalid payment method'),
  handleValidation,
];

const categoryValidator = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Category name required'),
  body('icon').optional().isLength({ max: 10 }).withMessage('Icon too long'),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Invalid color hex'),
  handleValidation,
];

module.exports = { registerValidator, loginValidator, expenseValidator, categoryValidator };
