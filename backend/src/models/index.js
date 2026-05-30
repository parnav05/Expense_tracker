const User = require('./User');
const Category = require('./Category');
const Expense = require('./Expense');

// Associations
User.hasMany(Expense, { foreignKey: 'user_id', as: 'expenses', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Category, { foreignKey: 'user_id', as: 'categories' });
Category.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Category.hasMany(Expense, { foreignKey: 'category_id', as: 'expenses' });
Expense.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

module.exports = { User, Category, Expense };
