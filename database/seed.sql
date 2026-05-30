-- ============================================================
-- ExpenseTracker — Seed Data
-- Demo user: demo@expense.com / Demo1234
-- ============================================================

USE expense_tracker;

-- ─── Demo User ────────────────────────────────────────────────────────────────
-- Password: Demo1234  (bcrypt hash, cost factor 12)
INSERT INTO users (id, name, email, password, currency, is_active) VALUES
(1, 'Demo User', 'demo@expense.com',
 '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/hItlQ9Cmi',
 'INR', 1)
ON DUPLICATE KEY UPDATE id = id;

-- ─── Default Categories (demo user) ───────────────────────────────────────────
INSERT INTO categories (id, name, icon, color, user_id, is_default) VALUES
(1,  'Food & Dining',  '🍽️', '#f59e0b', 1, 1),
(2,  'Transport',      '🚗', '#3b82f6', 1, 1),
(3,  'Shopping',       '🛍️', '#ec4899', 1, 1),
(4,  'Entertainment',  '🎬', '#8b5cf6', 1, 1),
(5,  'Health',         '💊', '#ef4444', 1, 1),
(6,  'Utilities',      '💡', '#10b981', 1, 1),
(7,  'Education',      '📚', '#06b6d4', 1, 1),
(8,  'Salary',         '💰', '#22c55e', 1, 1),
(9,  'Travel',         '✈️', '#f97316', 1, 1),
(10, 'Other',          '📦', '#6b7280', 1, 1)
ON DUPLICATE KEY UPDATE id = id;

-- ─── Sample Expenses (last 3 months) ─────────────────────────────────────────
INSERT INTO expenses (title, amount, description, date, type, payment_method, user_id, category_id) VALUES

-- May 2026
('Monthly Salary',        85000.00, 'May salary credit',          '2026-05-01', 'income',  'netbanking', 1, 8),
('Groceries - Big Bazaar', 2840.00, 'Monthly groceries',          '2026-05-02', 'expense', 'upi',        1, 1),
('Ola Cab - Office',        450.00, NULL,                          '2026-05-03', 'expense', 'upi',        1, 2),
('Netflix Subscription',    649.00, 'Monthly subscription',       '2026-05-04', 'expense', 'card',       1, 4),
('Lunch - Subway',          380.00, NULL,                          '2026-05-05', 'expense', 'upi',        1, 1),
('Electricity Bill',       1850.00, 'May electricity',            '2026-05-06', 'expense', 'netbanking', 1, 6),
('T-shirt - Myntra',       1299.00, NULL,                          '2026-05-07', 'expense', 'card',       1, 3),
('Gym Membership',         2000.00, 'Monthly gym fees',           '2026-05-08', 'expense', 'cash',       1, 5),
('Dinner - Zomato',         720.00, NULL,                          '2026-05-09', 'expense', 'upi',        1, 1),
('Metro Card Recharge',     500.00, NULL,                          '2026-05-10', 'expense', 'upi',        1, 2),
('Udemy Course',           1299.00, 'Docker & Kubernetes course',  '2026-05-11', 'expense', 'card',       1, 7),
('Freelance Project',     15000.00, 'React project payment',      '2026-05-12', 'income',  'netbanking', 1, 8),
('Petrol',                  800.00, NULL,                          '2026-05-13', 'expense', 'cash',       1, 2),
('Medicine',                430.00, 'Monthly medicines',          '2026-05-14', 'expense', 'cash',       1, 5),
('Swiggy Dinner',           550.00, NULL,                          '2026-05-15', 'expense', 'upi',        1, 1),
('Internet Bill',           999.00, 'Jio Fiber May',              '2026-05-16', 'expense', 'netbanking', 1, 6),
('Book - Clean Code',       599.00, NULL,                          '2026-05-17', 'expense', 'card',       1, 7),
('Shoes - Ajio',           2499.00, NULL,                          '2026-05-18', 'expense', 'card',       1, 3),
('Coffee - Starbucks',      380.00, NULL,                          '2026-05-19', 'expense', 'upi',        1, 1),
('Auto Rickshaw',           120.00, NULL,                          '2026-05-20', 'expense', 'cash',       1, 2),

-- April 2026
('Monthly Salary',        85000.00, 'April salary credit',        '2026-04-01', 'income',  'netbanking', 1, 8),
('Groceries',              3100.00, NULL,                          '2026-04-03', 'expense', 'upi',        1, 1),
('Weekend Trip - Manali',  8500.00, 'Travel + Hotel',             '2026-04-05', 'expense', 'card',       1, 9),
('Cab - Uber',              620.00, NULL,                          '2026-04-06', 'expense', 'upi',        1, 2),
('Doctor Visit',           800.00,  'Checkup fee',                '2026-04-08', 'expense', 'cash',       1, 5),
('Amazon Order',          1890.00,  'Keyboard + Mouse',           '2026-04-10', 'expense', 'card',       1, 3),
('Dinner - Barbeque Nation',1800.00,'Family dinner',              '2026-04-12', 'expense', 'card',       1, 1),
('Electricity Bill',       1700.00, NULL,                          '2026-04-15', 'expense', 'netbanking', 1, 6),
('Phone Recharge',          299.00, 'Airtel 3 months',            '2026-04-16', 'expense', 'upi',        1, 6),
('Movie - PVR',             650.00, NULL,                          '2026-04-18', 'expense', 'card',       1, 4),
('Freelance Income',      12000.00, 'DevOps consultation',        '2026-04-20', 'income',  'netbanking', 1, 8),
('Petrol',                  900.00, NULL,                          '2026-04-22', 'expense', 'cash',       1, 2),
('Lunch',                   450.00, NULL,                          '2026-04-23', 'expense', 'upi',        1, 1),

-- March 2026
('Monthly Salary',        85000.00, 'March salary',               '2026-03-01', 'income',  'netbanking', 1, 8),
('Groceries',              2950.00, NULL,                          '2026-03-02', 'expense', 'upi',        1, 1),
('Transport',               880.00, NULL,                          '2026-03-04', 'expense', 'upi',        1, 2),
('Clothes Shopping',       3200.00, 'Summer wardrobe',            '2026-03-06', 'expense', 'card',       1, 3),
('Medical',                 600.00, NULL,                          '2026-03-10', 'expense', 'cash',       1, 5),
('Electricity Bill',       1600.00, NULL,                          '2026-03-12', 'expense', 'netbanking', 1, 6),
('Course - AWS',           1999.00, 'AWS SAA prep course',        '2026-03-14', 'expense', 'card',       1, 7),
('Restaurant',              890.00, NULL,                          '2026-03-16', 'expense', 'card',       1, 1),
('Spotify',                 119.00, NULL,                          '2026-03-18', 'expense', 'card',       1, 4),
('Gas Cylinder',            950.00, NULL,                          '2026-03-20', 'expense', 'cash',       1, 6);

-- ─── Verify ───────────────────────────────────────────────────────────────────
SELECT 'Seed complete' AS status,
       (SELECT COUNT(*) FROM users)      AS users,
       (SELECT COUNT(*) FROM categories) AS categories,
       (SELECT COUNT(*) FROM expenses)   AS expenses;
