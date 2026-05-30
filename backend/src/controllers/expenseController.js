const { Op, fn, col, literal } = require('sequelize');
const { Expense, Category } = require('../models');

exports.createExpense = async (req, res, next) => {
  try {
    const { title, amount, description, date, type, payment_method, category_id } = req.body;

    // Verify category belongs to user
    const category = await Category.findOne({
      where: { id: category_id, user_id: req.user.id },
    });
    if (!category) {
      return res.status(400).json({ success: false, message: 'Invalid category.' });
    }

    const expense = await Expense.create({
      title, amount, description, date, type: type || 'expense',
      payment_method: payment_method || 'cash',
      user_id: req.user.id,
      category_id,
    });

    const result = await Expense.findByPk(expense.id, {
      include: [{ model: Category, as: 'category' }],
    });

    res.status(201).json({ success: true, message: 'Expense added!', data: { expense: result } });
  } catch (error) {
    next(error);
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, month, year, category_id, type, search,
      sort_by = 'date', sort_order = 'DESC',
    } = req.query;

    const where = { user_id: req.user.id };

    if (month && year) {
      where.date = {
        [Op.between]: [
          `${year}-${String(month).padStart(2, '0')}-01`,
          `${year}-${String(month).padStart(2, '0')}-31`,
        ],
      };
    } else if (year) {
      where.date = { [Op.between]: [`${year}-01-01`, `${year}-12-31`] };
    }

    if (category_id) where.category_id = category_id;
    if (type) where.type = type;
    if (search) where.title = { [Op.like]: `%${search}%` };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Expense.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category' }],
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      success: true,
      data: {
        expenses: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: Category, as: 'category' }],
    });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
    res.json({ success: true, data: { expense } });
  } catch (error) {
    next(error);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });

    const { title, amount, description, date, type, payment_method, category_id } = req.body;
    await expense.update({ title, amount, description, date, type, payment_method, category_id });

    const updated = await Expense.findByPk(expense.id, {
      include: [{ model: Category, as: 'category' }],
    });

    res.json({ success: true, message: 'Expense updated!', data: { expense: updated } });
  } catch (error) {
    next(error);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
    await expense.destroy();
    res.json({ success: true, message: 'Expense deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlySummary = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const summary = await Expense.findAll({
      where: {
        user_id: req.user.id,
        date: { [Op.between]: [`${year}-01-01`, `${year}-12-31`] },
      },
      attributes: [
        [fn('MONTH', col('date')), 'month'],
        [fn('SUM', literal("CASE WHEN type='expense' THEN amount ELSE 0 END")), 'total_expense'],
        [fn('SUM', literal("CASE WHEN type='income' THEN amount ELSE 0 END")), 'total_income'],
        [fn('COUNT', col('id')), 'count'],
      ],
      group: [fn('MONTH', col('date'))],
      order: [[literal('month'), 'ASC']],
      raw: true,
    });

    res.json({ success: true, data: { year, summary } });
  } catch (error) {
    next(error);
  }
};

exports.getCategorySummary = async (req, res, next) => {
  try {
    const { month, year = new Date().getFullYear() } = req.query;

    const where = {
      user_id: req.user.id,
      type: 'expense',
    };

    if (month) {
      where.date = {
        [Op.between]: [
          `${year}-${String(month).padStart(2, '0')}-01`,
          `${year}-${String(month).padStart(2, '0')}-31`,
        ],
      };
    } else {
      where.date = { [Op.between]: [`${year}-01-01`, `${year}-12-31`] };
    }

    const summary = await Expense.findAll({
      where,
      attributes: [
        'category_id',
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('Expense.id')), 'count'],
      ],
      include: [{ model: Category, as: 'category', attributes: ['name', 'icon', 'color'] }],
      group: ['category_id', 'category.id'],
      order: [[literal('total'), 'DESC']],
      raw: false,
    });

    res.json({ success: true, data: { summary } });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const monthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
    const monthEnd = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`;

    const [totalExpense, totalIncome, recentExpenses, categoryBreakdown] = await Promise.all([
      Expense.sum('amount', {
        where: { user_id: req.user.id, type: 'expense', date: { [Op.between]: [monthStart, monthEnd] } },
      }),
      Expense.sum('amount', {
        where: { user_id: req.user.id, type: 'income', date: { [Op.between]: [monthStart, monthEnd] } },
      }),
      Expense.findAll({
        where: { user_id: req.user.id },
        include: [{ model: Category, as: 'category' }],
        order: [['created_at', 'DESC']],
        limit: 5,
      }),
      Expense.findAll({
        where: {
          user_id: req.user.id,
          type: 'expense',
          date: { [Op.between]: [monthStart, monthEnd] },
        },
        attributes: ['category_id', [fn('SUM', col('amount')), 'total']],
        include: [{ model: Category, as: 'category', attributes: ['name', 'icon', 'color'] }],
        group: ['category_id', 'category.id'],
        order: [[literal('total'), 'DESC']],
        limit: 5,
        raw: false,
      }),
    ]);

    res.json({
      success: true,
      data: {
        current_month: {
          total_expense: totalExpense || 0,
          total_income: totalIncome || 0,
          balance: (totalIncome || 0) - (totalExpense || 0),
        },
        recent_expenses: recentExpenses,
        category_breakdown: categoryBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};
