# 💸 ExpenseTracker

A full-stack personal finance application built to learn **Git, GitHub, Docker, Docker Compose, GitHub Actions, and CI/CD**.

![Stack](https://img.shields.io/badge/Frontend-React_18-61dafb?logo=react)
![Stack](https://img.shields.io/badge/Backend-Node.js_20-339933?logo=nodedotjs)
![Stack](https://img.shields.io/badge/Database-MySQL_8.0-4479a1?logo=mysql)
![Stack](https://img.shields.io/badge/Container-Docker-2496ed?logo=docker)

---

## 🚀 Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/expense-tracker.git
cd expense-tracker
cp .env.example .env
docker-compose up --build
```

Open http://localhost:3000 → Login with `demo@expense.com` / `Demo1234`

---

## 📁 Project Structure

```
expense-tracker/
├── frontend/              # React 18 SPA
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # AuthContext (JWT state)
│   │   ├── pages/         # Dashboard, Expenses, Summary, etc.
│   │   ├── services/      # Axios API calls
│   │   └── styles/        # Global CSS design system
│   ├── nginx.conf         # Nginx SPA + proxy config
│   └── Dockerfile         # Multi-stage: Node build → Nginx serve
│
├── backend/               # Node.js Express REST API
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/     # Auth (JWT), error handler
│   │   ├── models/        # Sequelize ORM models
│   │   ├── routes/        # Express routers
│   │   └── validators/    # express-validator rules
│   ├── tests/             # Jest + Supertest unit tests
│   └── Dockerfile         # Multi-stage: deps → test → production
│
├── database/
│   ├── init.sql           # Schema (tables, indexes, constraints)
│   └── seed.sql           # Demo user + 3 months of sample data
│
├── docs/
│   ├── architecture.md    # System design + technology choices
│   ├── api-documentation.md # All REST endpoints with examples
│   └── deployment-guide.md  # Step-by-step setup + troubleshooting
│
├── .github/workflows/
│   ├── frontend-ci.yml    # Lint → Test → Build → Docker build test
│   ├── backend-ci.yml     # Lint → Test (with MySQL service) → Docker
│   └── docker-publish.yml # Build → Tag → Push to Docker Hub
│
└── docker-compose.yml     # MySQL + Backend + Frontend orchestration
```

---

## 🛠️ Technology Stack

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | React 18, React Router v6, Recharts, Axios   |
| Backend  | Node.js 20, Express 4, Sequelize, JWT        |
| Database | MySQL 8.0                                    |
| Server   | Nginx 1.25 (reverse proxy + static files)    |
| CI/CD    | GitHub Actions (3 workflows)                 |
| Registry | Docker Hub                                   |

---

## 📡 API Endpoints

| Method | Endpoint                        | Auth | Description              |
|--------|---------------------------------|------|--------------------------|
| POST   | /api/auth/register              | No   | Register new user        |
| POST   | /api/auth/login                 | No   | Login + get JWT token    |
| GET    | /api/expenses/dashboard         | Yes  | Current month stats      |
| GET    | /api/expenses                   | Yes  | List with filters + pagination |
| POST   | /api/expenses                   | Yes  | Create expense/income    |
| PUT    | /api/expenses/:id               | Yes  | Update                   |
| DELETE | /api/expenses/:id               | Yes  | Delete                   |
| GET    | /api/expenses/summary/monthly   | Yes  | Year-wise monthly totals |
| GET    | /api/expenses/summary/category  | Yes  | Category breakdown       |
| GET    | /api/categories                 | Yes  | List categories          |
| POST   | /api/categories                 | Yes  | Create custom category   |

Full docs → [docs/api-documentation.md](docs/api-documentation.md)

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f backend

# Run backend tests inside container
docker-compose exec backend npm test

# Connect to MySQL
docker-compose exec mysql mysql -u expenseuser -pexpensepass123 expense_tracker

# Stop + clean
docker-compose down -v
```

---

## ✅ CI/CD Pipeline

```
Push to main
    │
    ├── frontend-ci.yml ──▶ Lint → Test → Build → Docker build check
    │
    ├── backend-ci.yml  ──▶ Lint → Test (MySQL service) → Syntax check
    │
    └── docker-publish.yml (on main/tag) ──▶ Build → Push to Docker Hub
                                                ├── expense-backend:latest
                                                └── expense-frontend:latest
```

---

## 📚 Learning Objectives

This project covers:
- **Git** — branching, commits, PRs, tagging releases
- **GitHub** — Actions, Secrets, workflow triggers
- **Docker** — multi-stage builds, .dockerignore, health checks, non-root users
- **Docker Compose** — service orchestration, networks, volumes, `depends_on`
- **CI/CD** — automated testing, build validation, image publishing
- **REST APIs** — JWT auth, CRUD, pagination, filtering
- **React** — context, hooks, protected routes, Recharts
