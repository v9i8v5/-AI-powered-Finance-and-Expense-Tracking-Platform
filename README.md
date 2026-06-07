# AI-Powered Finance & Expense Tracking Platform

A full-stack personal finance management platform with AI-powered insights, intelligent chatbot, expense tracking, income management, budget planning, and rich analytics — built with **FastAPI**, **React**, and **MongoDB**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Option 1: Docker (Recommended)](#option-1-docker-recommended)
  - [Option 2: Manual Setup](#option-2-manual-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [AI Integration](#ai-integration)
- [Database Design](#database-design)
- [Screenshots](#screenshots)

---

## Overview

FinanceAI helps users take full control of their personal finances. It tracks every rupee in and out, visualizes spending patterns with interactive charts, enforces budget limits, and provides an AI financial advisor that can answer natural-language questions about your money.

---

## Features

| Feature | Status |
|---------|--------|
| JWT Authentication (register / login) | ✅ Complete |
| Expense CRUD with category filtering & search | ✅ Complete |
| Income CRUD with source tracking | ✅ Complete |
| Budget management with live spend tracking | ✅ Complete |
| Analytics dashboard (trends, pie, savings) | ✅ Complete |
| AI Financial Summary Generator | ✅ Complete |
| AI Chatbot Assistant (FinBot) | ✅ Complete |
| Dark / Light theme | ✅ Complete |
| Responsive sidebar layout | ✅ Complete |
| MongoDB indexes for query optimization | ✅ Complete |
| Docker Compose full-stack setup | ✅ Complete |

---

## Tech Stack

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| FastAPI | 0.104 | REST API framework |
| Motor | 3.3 | Async MongoDB driver |
| MongoDB | 7.0 | Primary database |
| Pydantic v2 | ≥2.6 | Data validation & settings |
| python-jose | 3.3 | JWT tokens |
| passlib + bcrypt | — | Password hashing |
| OpenAI SDK | 1.3 | AI chat & summaries |
| Uvicorn | 0.24 | ASGI server |

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5.3 | Type safety |
| Vite | 5 | Build tool |
| Redux Toolkit | 1.9 | State management |
| React Router | 6 | Client-side routing |
| Axios | 1.6 | HTTP client |
| Recharts | 2.10 | Charts & visualizations |
| Tailwind CSS | 3.3 | Utility-first styling |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   React Frontend                       │
│  Redux Store (auth, expense, income, budget,          │
│               analytics, theme)                        │
│  Pages: Dashboard, Expenses, Income, Budgets,         │
│         Analytics, AI Chat                            │
└─────────────────────┬────────────────────────────────┘
                      │  HTTP (Vite proxy / Nginx)
                      ▼
┌──────────────────────────────────────────────────────┐
│              FastAPI Backend                           │
│  Routers: /api/auth, /api/expenses, /api/income,      │
│           /api/budgets, /api/analytics, /api/ai       │
│  Services: expense, income, budget, analytics, ai     │
│  Auth: JWT (HTTPBearer)                               │
└─────────────────────┬────────────────────────────────┘
                      │  Motor (async)
                      ▼
┌──────────────────────────────────────────────────────┐
│                   MongoDB                              │
│  Collections: users, expenses, income, budgets        │
│  Indexes: user_id+date, user_id+category, email       │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
              OpenAI API (optional)
              gpt-4o-mini for chat & summaries
              Rule-based fallback when no key
```

---

## Project Structure

```
Finance Tracking System/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai.py            # AI summary + chat endpoints
│   │   │   ├── analytics.py     # Summary, trends, category breakdown
│   │   │   ├── budgets.py       # Budget CRUD
│   │   │   ├── expenses.py      # Expense CRUD
│   │   │   ├── income.py        # Income CRUD
│   │   │   └── users.py         # Auth (register/login/me)
│   │   ├── auth/
│   │   │   └── __init__.py      # JWT + bcrypt helpers
│   │   ├── db/
│   │   │   └── __init__.py      # MongoDB connection + indexes
│   │   ├── models/
│   │   │   └── __init__.py      # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── analytics_service.py  # Aggregation logic
│   │   │   ├── ai_service.py         # OpenAI + rule-based fallback
│   │   │   ├── budget_service.py     # Budget CRUD + spend tracking
│   │   │   ├── expense_service.py    # Expense CRUD
│   │   │   └── income_service.py     # Income CRUD
│   │   ├── config.py            # Pydantic settings (env vars)
│   │   └── main.py              # FastAPI app entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx        # Sidebar + header shell
│   │   │   ├── Modal.tsx         # Reusable modal dialog
│   │   │   ├── StatCard.tsx      # KPI summary card
│   │   │   └── LoadingSpinner.tsx
│   │   ├── hooks/
│   │   │   ├── useApi.ts         # Axios instance with auth header
│   │   │   └── useRedux.ts       # Typed store hooks
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx     # Overview with charts
│   │   │   ├── Expenses.tsx      # Full CRUD + filter/search
│   │   │   ├── Income.tsx        # Full CRUD
│   │   │   ├── Budgets.tsx       # Budget cards with progress bars
│   │   │   ├── Analytics.tsx     # Deep analytics with Recharts
│   │   │   ├── AIChat.tsx        # FinBot chat + AI summary
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── routes/
│   │   │   └── Router.tsx        # Protected + public routes
│   │   ├── store/
│   │   │   ├── index.ts
│   │   │   └── slices/
│   │   │       ├── authSlice.ts
│   │   │       ├── expenseSlice.ts
│   │   │       ├── incomeSlice.ts
│   │   │       ├── budgetSlice.ts
│   │   │       ├── analyticsSlice.ts
│   │   │       └── themeSlice.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
│
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- **Docker & Docker Compose** (recommended), or
- Python 3.11+, Node.js 18+, MongoDB 6+

---

### Option 1: Docker (Recommended)

```bash
git clone <repo-url>
cd "Finance Tracking System"

# Copy and configure environment
cp backend/.env.example backend/.env
# Edit backend/.env — set SECRET_KEY and optionally OPENAI_API_KEY

# Start everything
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

### Option 2: Manual Setup

#### Backend

```bash
cd backend

python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux
# Edit .env with your values

python -m uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at **http://localhost:5173** — API calls are proxied to port 8000.

---

## Environment Variables

`backend/.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DATABASE_NAME` | Database name | `finance_tracker` |
| `SECRET_KEY` | JWT signing secret — **change in production** | — |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `30` |
| `OPENAI_API_KEY` | OpenAI key for AI features (optional) | — |
| `DEBUG` | Enable debug mode | `False` |

> Without `OPENAI_API_KEY`, the AI features fall back to a built-in rule-based engine — still functional, just not LLM-powered.

---

## API Reference

All protected routes require: `Authorization: Bearer <token>`

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |

### Expenses — `/api/expenses`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/expenses` | ✅ | List expenses (limit, skip) |
| POST | `/api/expenses` | ✅ | Create expense |
| PUT | `/api/expenses/{id}` | ✅ | Update expense |
| DELETE | `/api/expenses/{id}` | ✅ | Delete expense |
| GET | `/api/expenses/categories` | ✅ | Available categories |

### Income — `/api/income`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/income` | ✅ | List income records |
| POST | `/api/income` | ✅ | Create income record |
| PUT | `/api/income/{id}` | ✅ | Update income record |
| DELETE | `/api/income/{id}` | ✅ | Delete income record |

### Budgets — `/api/budgets`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/budgets` | ✅ | List budgets with current spend |
| POST | `/api/budgets` | ✅ | Create/upsert budget |
| PUT | `/api/budgets/{id}` | ✅ | Update budget limit |
| DELETE | `/api/budgets/{id}` | ✅ | Delete budget |

### Analytics — `/api/analytics`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/analytics/summary` | ✅ | Full financial summary |
| GET | `/api/analytics/trends?months=6` | ✅ | Monthly income vs expense |
| GET | `/api/analytics/categories?period=month` | ✅ | Spend by category |

### AI — `/api/ai`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/ai/summary` | ✅ | AI-generated narrative summary |
| POST | `/api/ai/chat` | ✅ | Chat with FinBot advisor |

Interactive docs: **http://localhost:8000/docs**

---

## AI Integration

### Financial Summary Generator
`GET /api/ai/summary`

Builds a real-time financial context string from the user's actual transaction data (income, expenses, categories, month-over-month trends) and passes it to **GPT-4o-mini** to generate a 3–5 sentence personalized narrative.

Example output:
> "This month you earned $4,200 and spent $2,850, saving 32% of your income. Your highest spending category was Transportation at $680 (24%). Compared to last month, your total expenses increased by 8%. To hit your savings goal, consider reducing Entertainment spending by $150."

### AI Chatbot (FinBot)
`POST /api/ai/chat`

A context-aware conversational assistant. Each request includes:
- A real-time financial snapshot (income, expenses, categories, trends)
- The last 10 messages of chat history for context continuity

Supports queries like:
- *"How much did I spend on food this month?"*
- *"What was my biggest expense category?"*
- *"How can I improve my savings rate?"*

**Fallback**: When `OPENAI_API_KEY` is not configured, both features use a keyword-matching rule-based engine that still provides useful answers from the real financial data.

---

## Database Design

### Collections

**users**
```json
{
  "_id": ObjectId,
  "email": "string (unique)",
  "password_hash": "string",
  "name": "string",
  "theme": "light | dark",
  "created_at": "datetime"
}
```

**expenses**
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "amount": 150.00,
  "category": "Food & Dining",
  "description": "Grocery run",
  "date": "datetime",
  "created_at": "datetime"
}
```

**income**
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "amount": 5000.00,
  "source": "Salary",
  "description": "Monthly salary",
  "date": "datetime",
  "created_at": "datetime"
}
```

**budgets**
```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "category": "Food & Dining",
  "limit": 500.00,
  "created_at": "datetime"
}
```

### Indexes
| Collection | Index | Type |
|------------|-------|------|
| users | email | Unique |
| expenses | (user_id, date) | Compound |
| expenses | (user_id, category) | Compound |
| income | (user_id, date) | Compound |
| budgets | (user_id, category) | Unique compound |

---

## Product Decisions & Tradeoffs

- **MongoDB over SQL**: Schema flexibility for financial records that may vary in structure; Motor provides non-blocking async I/O that fits FastAPI's async model well.
- **Rule-based AI fallback**: Ensures the platform is fully functional without an OpenAI API key, which matters for local dev and cost control.
- **Upsert for budgets**: One budget per category per user — simpler UX, no duplicates.
- **Redux Toolkit over React Query**: The assessment specified Redux; RTK simplifies the boilerplate significantly while keeping full predictability.
- **Client-side filtering**: Expense/income search and filter happen client-side after a full fetch. Acceptable for personal finance scale; would move to server-side pagination for multi-user production.
