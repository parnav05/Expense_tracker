const { Category, Expense } = require('../models');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { user_id: req.user.id },
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name, icon, color } = req.body;

    const existing = await Category.findOne({ where: { name, user_id: req.user.id } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Category already exists.' });
    }

    const category = await Category.create({
      name, icon: icon || '📦', color: color || '#6366f1',
      user_id: req.user.id,
    });
    res.status(201).json({ success: true, message: 'Category created!', data: { category } });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

    const { name, icon, color } = req.body;
    await category.update({ name, icon, color });
    res.json({ success: true, message: 'Category updated!', data: { category } });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

    const expenseCount = await Expense.count({ where: { category_id: category.id } });
    if (expenseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${expenseCount} expenses.`,
      });
    }

    await category.destroy();
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};
