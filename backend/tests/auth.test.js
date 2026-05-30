const request = require('supertest');

// Mock sequelize before importing app
jest.mock('../src/config/database', () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    define: jest.fn(),
  },
  connectDB: jest.fn(),
}));

jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Category: {
    bulkCreate: jest.fn(),
    findAll: jest.fn(),
  },
  Expense: {
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
  },
}));

const app = require('../src/app');
const { User, Category } = require('../src/models');

describe('Auth API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const mockUser = { id: 1, name: 'Test User', email: 'test@test.com', toJSON: () => ({ id: 1, name: 'Test User', email: 'test@test.com' }) };

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);
      Category.bulkCreate.mockResolvedValue([]);

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@test.com',
        password: 'Test1234',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test',
        email: 'not-an-email',
        password: 'Test1234',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for weak password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test',
        email: 'test@test.com',
        password: 'abc',
      });
      expect(res.status).toBe(400);
    });

    it('should return 409 for duplicate email', async () => {
      User.findOne.mockResolvedValue({ id: 1 });

      const res = await request(app).post('/api/auth/register').send({
        name: 'Test',
        email: 'existing@test.com',
        password: 'Test1234',
      });
      expect(res.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 for wrong credentials', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send({
        email: 'wrong@test.com',
        password: 'WrongPass1',
      });
      expect(res.status).toBe(401);
    });

    it('should return 400 for missing fields', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: 'test@test.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});
