const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/database', () => ({
  sequelize: { authenticate: jest.fn(), sync: jest.fn(), define: jest.fn() },
  connectDB: jest.fn(),
}));

jest.mock('../src/models', () => ({
  User: { findByPk: jest.fn(), findOne: jest.fn() },
  Category: { findOne: jest.fn(), findAll: jest.fn() },
  Expense: {
    create: jest.fn(),
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    sum: jest.fn(),
    count: jest.fn(),
  },
}));

process.env.JWT_SECRET = 'test-secret-key-for-testing-only';

const app = require('../src/app');
const { User, Category, Expense } = require('../src/models');

const mockUser = {
  id: 1, name: 'Test', email: 'test@test.com', is_active: true,
  toJSON: () => ({ id: 1, name: 'Test', email: 'test@test.com' }),
};
const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);

describe('Expense API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findByPk.mockResolvedValue(mockUser);
  });

  describe('GET /api/expenses', () => {
    it('should return expenses for authenticated user', async () => {
      Expense.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const res = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('expenses');
      expect(res.body.data).toHaveProperty('pagination');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/expenses');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/expenses', () => {
    it('should create an expense', async () => {
      const mockCategory = { id: 1, name: 'Food', user_id: 1 };
      const mockExpense = {
        id: 1, title: 'Lunch', amount: 150, date: '2024-01-15',
        category_id: 1, user_id: 1,
      };

      Category.findOne.mockResolvedValue(mockCategory);
      Expense.create.mockResolvedValue(mockExpense);
      Expense.findByPk.mockResolvedValue({ ...mockExpense, category: mockCategory });

      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Lunch', amount: 150, date: '2024-01-15', category_id: 1 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should reject expense with invalid amount', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test', amount: -50, date: '2024-01-15', category_id: 1 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/expenses/dashboard', () => {
    it('should return dashboard stats', async () => {
      Expense.sum.mockResolvedValue(5000);
      Expense.findAll.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/expenses/dashboard')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('current_month');
    });
  });
});
