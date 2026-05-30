# API Documentation — ExpenseTracker

**Base URL:** `http://localhost:5000/api`

All protected routes require:
```
Authorization: Bearer <jwt_token>
```

All responses follow:
```json
{ "success": true|false, "message": "...", "data": { ... } }
```

---

## Auth Endpoints

### POST /auth/register
Register a new user. Auto-creates 9 default categories.

**Request:**
```json
{
  "name": "Pranav Sharma",
  "email": "pranav@example.com",
  "password": "MyPass123",
  "currency": "INR"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Registration successful!",
  "data": {
    "user": { "id": 1, "name": "Pranav Sharma", "email": "pranav@example.com", "currency": "INR" },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:** `400` validation, `409` email exists

---

### POST /auth/login

**Request:**
```json
{ "email": "pranav@example.com", "password": "MyPass123" }
```

**Response `200`:** Same shape as register

**Errors:** `400` validation, `401` wrong credentials

---

### GET /auth/profile  🔒
Returns authenticated user's profile.

---

### PUT /auth/profile  🔒

**Request:**
```json
{ "name": "Pranav S", "currency": "USD" }
```

---

## Expense Endpoints

### GET /expenses  🔒

Query params:

| Param       | Type    | Description                       |
|-------------|---------|-----------------------------------|
| page        | int     | Page number (default: 1)          |
| limit       | int     | Per page (default: 20)            |
| month       | int     | 1–12                              |
| year        | int     | e.g. 2026                         |
| category_id | int     | Filter by category                |
| type        | string  | `expense` or `income`             |
| search      | string  | Title search (partial match)      |
| sort_by     | string  | `date`, `amount` (default: `date`)|
| sort_order  | string  | `ASC` or `DESC` (default: `DESC`) |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": 1, "title": "Lunch", "amount": "380.00",
        "date": "2026-05-05", "type": "expense",
        "payment_method": "upi",
        "category": { "id": 1, "name": "Food & Dining", "icon": "🍽️", "color": "#f59e0b" }
      }
    ],
    "pagination": { "total": 45, "page": 1, "limit": 20, "pages": 3 }
  }
}
```

---

### POST /expenses  🔒

**Request:**
```json
{
  "title": "Lunch at Subway",
  "amount": 380.00,
  "date": "2026-05-05",
  "category_id": 1,
  "type": "expense",
  "payment_method": "upi",
  "description": "Optional notes"
}
```

**Response `201`:** Created expense with category

**Errors:** `400` validation, `400` invalid category

---

### GET /expenses/:id  🔒
Get single expense by ID.

---

### PUT /expenses/:id  🔒
Update expense. Same body as POST.

---

### DELETE /expenses/:id  🔒
Delete expense. Response `200` on success.

---

### GET /expenses/dashboard  🔒

Returns current month stats + recent transactions + category breakdown.

**Response `200`:**
```json
{
  "data": {
    "current_month": {
      "total_expense": 18450.00,
      "total_income": 100000.00,
      "balance": 81550.00
    },
    "recent_expenses": [ ...5 most recent expenses... ],
    "category_breakdown": [
      { "category_id": 1, "total": "5230.00", "category": { "name": "Food & Dining", "icon": "🍽️", "color": "#f59e0b" } }
    ]
  }
}
```

---

### GET /expenses/summary/monthly  🔒

Query: `?year=2026`

**Response:**
```json
{
  "data": {
    "year": "2026",
    "summary": [
      { "month": "1", "total_expense": "12000.00", "total_income": "85000.00", "count": "18" },
      { "month": "2", "total_expense": "9500.00",  "total_income": "85000.00", "count": "14" }
    ]
  }
}
```

---

### GET /expenses/summary/category  🔒

Query: `?month=5&year=2026`

**Response:**
```json
{
  "data": {
    "summary": [
      {
        "category_id": 1, "total": "5380.00", "count": "8",
        "category": { "name": "Food & Dining", "icon": "🍽️", "color": "#f59e0b" }
      }
    ]
  }
}
```

---

## Category Endpoints

### GET /categories  🔒
Returns all categories for the authenticated user.

---

### POST /categories  🔒

**Request:**
```json
{ "name": "Groceries", "icon": "🛒", "color": "#22c55e" }
```

---

### PUT /categories/:id  🔒

**Request:** Same as POST

---

### DELETE /categories/:id  🔒
Fails with `400` if category has associated expenses.

---

## System Endpoints

### GET /health  (public)
```json
{ "status": "ok", "timestamp": "2026-05-30T10:00:00.000Z", "uptime": 3600 }
```

---

## Error Response Shape

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "amount", "message": "Amount must be greater than 0" }
  ]
}
```

**HTTP Status Codes used:**
| Code | Meaning                      |
|------|------------------------------|
| 200  | Success                      |
| 201  | Created                      |
| 400  | Validation / Bad request     |
| 401  | Unauthenticated              |
| 403  | Forbidden                    |
| 404  | Not found                    |
| 409  | Conflict (duplicate)         |
| 429  | Rate limit exceeded          |
| 500  | Internal server error        |
