const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING(50),
      defaultValue: '📦',
    },
    color: {
      type: DataTypes.STRING(20),
      defaultValue: '#6366f1',
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // null = global/default category
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: 'categories',
  }
);

module.exports = Category;
