const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { categoryValidator } = require('../validators');

router.use(authenticate);

router.route('/').get(categoryController.getCategories).post(categoryValidator, categoryController.createCategory);
router.route('/:id').put(categoryValidator, categoryController.updateCategory).delete(categoryController.deleteCategory);

module.exports = router;
