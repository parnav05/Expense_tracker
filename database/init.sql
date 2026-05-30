-- ============================================================
-- ExpenseTracker — Database Schema
-- MySQL 8.0
-- ============================================================

SET NAMES utf8mb4;
SET character_set_client = utf8mb4;

-- Use the database (already created by MYSQL_DATABASE env var)
USE expense_tracker;

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            INT           NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL,
    password      VARCHAR(255)  NOT NULL,
    currency      VARCHAR(10)   NOT NULL DEFAULT 'INR',
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    INDEX idx_users_email (email),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Categories ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id            INT           NOT NULL AUTO_INCREMENT,
    name          VARCHAR(100)  NOT NULL,
    icon          VARCHAR(20)   NOT NULL DEFAULT '📦',
    color         VARCHAR(20)   NOT NULL DEFAULT '#6366f1',
    user_id       INT               NULL,
    is_default    TINYINT(1)    NOT NULL DEFAULT 0,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_categories_user (user_id),
    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Expenses ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
    id              INT             NOT NULL AUTO_INCREMENT,
    title           VARCHAR(200)    NOT NULL,
    amount          DECIMAL(12, 2)  NOT NULL,
    description     TEXT                NULL,
    date            DATE            NOT NULL,
    type            ENUM('expense', 'income') NOT NULL DEFAULT 'expense',
    payment_method  ENUM('cash', 'card', 'upi', 'netbanking', 'other') NOT NULL DEFAULT 'cash',
    user_id         INT             NOT NULL,
    category_id     INT             NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_expenses_user     (user_id),
    INDEX idx_expenses_date     (date),
    INDEX idx_expenses_category (category_id),
    INDEX idx_expenses_type     (type),
    INDEX idx_expenses_user_date (user_id, date),
    CONSTRAINT fk_expenses_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_expenses_category
        FOREIGN KEY (category_id) REFERENCES categories (id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_amount CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
