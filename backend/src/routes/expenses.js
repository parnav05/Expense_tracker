const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/auth');
const { expenseValidator } = require('../validators');

router.use(authenticate);

router.get('/dashboard', expenseController.getDashboardStats);
router.get('/summary/monthly', expenseController.getMonthlySummary);
router.get('/summary/category', expenseController.getCategorySummary);

router.route('/').get(expenseController.getExpenses).post(expenseValidator, expenseController.createExpense);

router
  .route('/:id')
  .get(expenseController.getExpense)
  .put(expenseValidator, expenseController.updateExpense)
  .delete(expenseController.deleteExpense);

module.exports = router;
