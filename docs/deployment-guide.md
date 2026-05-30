# Deployment Guide — ExpenseTracker

## Prerequisites

| Tool          | Version   | Install                              |
|---------------|-----------|--------------------------------------|
| Git           | ≥ 2.40    | `sudo dnf install git`               |
| Docker        | ≥ 24      | https://docs.docker.com/engine/install/|
| Docker Compose| ≥ 2.20    | Included with Docker Desktop         |
| Node.js       | 20 LTS    | https://nodejs.org (for local dev)   |

---

## 1. Clone & Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/expense-tracker.git
cd expense-tracker

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `.env` — at minimum change:
```env
JWT_SECRET=your_random_64_char_string_here
DB_PASSWORD=your_strong_password
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 2. Run with Docker Compose (Recommended)

```bash
# Build and start all services (MySQL + Backend + Frontend)
docker-compose up --build

# Run in background
docker-compose up --build -d

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f mysql

# Stop
docker-compose down

# Stop and remove volumes (deletes DB data!)
docker-compose down -v
```

Access:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health
- **Demo Login:** demo@expense.com / Demo1234

---

## 3. Run Locally (Without Docker)

### Start MySQL
```bash
# Option A: Docker MySQL only
docker run -d \
  --name expense-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword123 \
  -e MYSQL_DATABASE=expense_tracker \
  -e MYSQL_USER=expenseuser \
  -e MYSQL_PASSWORD=expensepass123 \
  -p 3306:3306 \
  mysql:8.0

# Wait for MySQL to be ready
docker exec expense-mysql mysqladmin ping -h localhost -u root -prootpassword123

# Run schema + seed
docker exec -i expense-mysql mysql -u expenseuser -pexpensepass123 expense_tracker < database/init.sql
docker exec -i expense-mysql mysql -u expenseuser -pexpensepass123 expense_tracker < database/seed.sql
```

### Start Backend
```bash
cd backend
cp .env.example .env    # edit as needed
npm install
npm run dev             # starts with nodemon on port 5000
```

### Start Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start               # starts on port 3000
```

---

## 4. Docker Commands Reference

```bash
# Build individual images
docker build -t expense-backend ./backend
docker build -t expense-frontend ./frontend \
  --build-arg REACT_APP_API_URL=/api

# Run individual container
docker run -p 5000:5000 \
  -e DB_HOST=host.docker.internal \
  -e DB_NAME=expense_tracker \
  -e DB_USER=expenseuser \
  -e DB_PASSWORD=expensepass123 \
  -e JWT_SECRET=your_secret \
  expense-backend

# Check container health
docker inspect --format='{{json .State.Health}}' expense-backend

# View container resource usage
docker stats

# Enter running container
docker exec -it expense-backend sh
docker exec -it expense-mysql mysql -u expenseuser -pexpensepass123 expense_tracker

# View image layers and sizes
docker history expense-backend
docker images expense-*
```

---

## 5. GitHub Actions Setup

### Required Secrets (Settings → Secrets → Actions)

| Secret Name           | Value                         |
|-----------------------|-------------------------------|
| `DOCKER_HUB_USERNAME` | Your Docker Hub username      |
| `DOCKER_HUB_TOKEN`    | Docker Hub Access Token (not password) |

Generate Docker Hub token: Docker Hub → Account Settings → Security → New Access Token

### Workflow Triggers

| Workflow            | Triggers On                           |
|---------------------|---------------------------------------|
| `frontend-ci.yml`   | Push/PR to main/develop, frontend/**  |
| `backend-ci.yml`    | Push/PR to main/develop, backend/**   |
| `docker-publish.yml`| Push to main, any `v*.*.*` tag        |

### Publishing a release:
```bash
git tag v1.0.0
git push origin v1.0.0
# → triggers docker-publish.yml, pushes with tag v1.0.0 + latest
```

---

## 6. Production Checklist

- [ ] Change all default passwords in `.env`
- [ ] Set strong `JWT_SECRET` (64+ chars, random)
- [ ] Set `NODE_ENV=production`
- [ ] Restrict `CORS_ORIGIN` to your domain
- [ ] Set up HTTPS (Nginx SSL or a load balancer)
- [ ] Enable MySQL backups (cron + mysqldump)
- [ ] Configure log rotation for `backend-logs` volume
- [ ] Add monitoring (Prometheus + Grafana, or Datadog)
- [ ] Remove demo seed data or change demo password

---

## 7. Troubleshooting

**Backend can't connect to MySQL:**
```bash
# Check MySQL health
docker-compose ps
docker-compose logs mysql

# MySQL not ready yet — backend has retry logic, wait 30s
# Or check if port 3306 is already in use on host
lsof -i :3306
```

**Frontend 502 Bad Gateway:**
```bash
# Backend not healthy yet
docker-compose logs backend
# Check health status
docker inspect expense-backend | grep -A 10 '"Health"'
```

**Port already in use:**
```bash
# Change ports in docker-compose.yml or kill conflicting process
lsof -i :3000 | grep LISTEN
kill -9 <PID>
```

**Reset everything and start fresh:**
```bash
docker-compose down -v --remove-orphans
docker system prune -f
docker-compose up --build
```
