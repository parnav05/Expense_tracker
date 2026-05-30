# Architecture Overview — ExpenseTracker

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Network (expense-net)          │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Frontend       │    │    Backend       │                │
│  │  React + Nginx   │───▶│  Node.js/Express │               │
│  │  Port: 3000→80  │    │   Port: 5000     │                │
│  └─────────────────┘    └────────┬────────┘                │
│          ▲                        │                          │
│          │ /api/* (proxy)         │ Sequelize ORM           │
│   Browser requests                ▼                          │
│                          ┌─────────────────┐                │
│                          │     MySQL 8.0    │                │
│                          │   Port: 3306     │                │
│                          │  Persistent Vol  │                │
│                          └─────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## Why Node.js over Spring Boot?

| Concern          | Node.js Express        | Spring Boot         |
|------------------|------------------------|---------------------|
| Docker image size | ~150MB                 | ~350MB+             |
| Startup time     | ~1s                    | ~5–15s              |
| Dev iteration    | Fast (hot reload)      | Slower              |
| Learning curve   | Matches React JS stack | Java knowledge req  |
| CI pipeline time | 30–60s                 | 2–4 min             |

For a **DevOps learning project** targeting fast feedback loops and lean containers, Node.js is the right choice.

## Technology Stack

### Frontend
- **React 18** — component-based SPA
- **React Router v6** — client-side routing
- **Recharts** — data visualization (AreaChart, BarChart, PieChart)
- **Axios** — HTTP client with interceptors
- **react-hot-toast** — notifications
- **Nginx** — production static server + API reverse proxy

### Backend
- **Node.js 20 + Express 4** — REST API framework
- **Sequelize 6** — MySQL ORM (models, associations, migrations)
- **JWT (jsonwebtoken)** — stateless authentication
- **bcryptjs** — password hashing (cost factor 12)
- **express-validator** — input validation
- **helmet** — HTTP security headers
- **express-rate-limit** — brute-force protection
- **winston** — structured logging

### Database
- **MySQL 8.0** — relational database
- **Persistent Docker volume** — data survives container restarts

### DevOps
- **Docker** — multi-stage builds for lean images
- **Docker Compose** — local orchestration
- **GitHub Actions** — CI/CD pipelines
- **Docker Hub** — image registry

## Data Flow

```
User Action
    │
    ▼
React Component (state update)
    │
    ▼
API Service (axios) ──▶ POST /api/expenses
                              │
                         Express Router
                              │
                         Auth Middleware (JWT verify)
                              │
                         Validator Middleware
                              │
                         Controller (business logic)
                              │
                         Sequelize Model ──▶ MySQL Query
                              │
                         JSON Response ──▶ React State Update
                              │
                         UI Re-render
```

## Security Architecture

- **JWT tokens** stored in `localStorage` (acceptable for learning; use httpOnly cookies in prod)
- **bcrypt** password hashing (cost factor 12 — ~300ms hash time, brute-force resistant)
- **Helmet.js** sets: `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`
- **Rate limiting**: 100 req/15min global, 10 req/15min on auth endpoints
- **CORS** restricted to configured origin
- **Input validation** on every write endpoint (express-validator)
- **SQL injection prevention** via Sequelize parameterized queries
- **Non-root Docker users** in both frontend and backend containers

## Folder Structure Rationale

```
backend/src/
├── config/       # DB connection — separated for easy mock in tests
├── controllers/  # Business logic only — no Express-specific code
├── middleware/   # Cross-cutting concerns: auth, errors
├── models/       # Sequelize model definitions + associations
├── routes/       # URL → controller mapping
├── utils/        # Logger, helpers
└── validators/   # Input validation rules per endpoint
```
