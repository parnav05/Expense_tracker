const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Expense = sequelize.define(
  'Expense',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { len: [1, 200] },
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: { min: 0.01 },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('expense', 'income'),
      defaultValue: 'expense',
    },
    payment_method: {
      type: DataTypes.ENUM('cash', 'card', 'upi', 'netbanking', 'other'),
      defaultValue: 'cash',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'expenses',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['date'] },
      { fields: ['category_id'] },
    ],
  }
);

module.exports = Expense;
