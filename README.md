# Task Management Application

A full-stack task management system with role-based access control, project organization, task tracking, and JWT authentication.

## Project Overview

This project is a multi-tenant task management application consisting of a NestJS RESTful backend, a React/Vite frontend, and a PostgreSQL database. It is designed around clear data isolation bounds (users only access projects they own or belong to) and a dual-token authentication flow.

## Technology Stack

### Backend
- NestJS, TypeScript
- TypeORM, PostgreSQL
- Passport-JWT, bcryptjs
- `@nestjs/swagger` for API documentation
- Jest for unit testing

### Frontend
- React 18, Vite
- React Router v6
- Axios with interceptors
- Vanilla CSS design system

### Infrastructure & Deployment
- Docker & Docker Compose
- Backend Deployed on Render (`https://farm-build-your-portfolio-project-2.onrender.com`)
- Frontend Deployed on Vercel (`https://taskboard-one-theta.vercel.app`)
- PostgreSQL hosted on Neon

## Key Implemented Features

- **Authentication & Security:** User registration, login, logout, logout all sessions, change password, forgot/reset password. JWT access tokens paired with httpOnly refresh cookies and automatic client token rotation.
- **Project Management:** Project creation, editing, deletion, and member management (adding/removing members by User ID).
- **Task Management:** Task creation, editing, status changes (To Do, In Progress, Done), priority assignments, and deletion.
- **Search, Filter & Sort:** Server-side and client-side filtering by status, priority, assignee, text search, sorting, and pagination.
- **Role-Based Access Control:** Project creators hold Admin rights (can edit project details and manage members). Members can view projects and update tasks.

## System Architecture

```
[ React Frontend (Vercel) ] <--- HTTP + httpOnly Cookie ---> [ NestJS Backend (Render) ] <---> [ PostgreSQL (Neon) ]
```

1. **Authentication Flow:** On login, the backend responds with a short-lived JSON access token and sets an `httpOnly` refresh token cookie. Axios request interceptors attach the access token to outgoing requests; response interceptors automatically call `/auth/refresh` on `401 Unauthorized` responses to obtain a fresh access token seamlessly.
2. **Access Control:** All project and task endpoints enforce membership verification via guards and TypeORM query constraints.

## Folder Structure

```
taskboard/
├── backend/                  # NestJS API application
│   ├── src/                  # Controllers, services, modules, entities
│   ├── test/                 # Service unit tests
│   ├── Dockerfile            # Container configuration
│   └── package.json
├── frontend/                 # React frontend application
│   ├── src/                  # Components, pages, context, styles
│   ├── Dockerfile            # NGINX container configuration
│   └── package.json
├── docker-compose.yml        # Local multi-container orchestration
└── README.md
```

## Local Development Setup

### Native Setup

1. **Backend:**
   ```bash
   cd backend
   npm install
   # Create .env file with DATABASE_* and JWT_* credentials
   npm run start:dev
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   # Create .env file with VITE_API_URL=http://localhost:3001/api
   npm run dev
   ```

### Docker Setup

Run the entire application stack (PostgreSQL, Backend API, Frontend NGINX) using Docker Compose from the root directory:

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`
- Swagger Documentation: `http://localhost:3001/api/docs`

## API Documentation

- **Swagger UI (Local):** `http://localhost:3001/api/docs`
- **Swagger UI (Production):** `https://farm-build-your-portfolio-project-2.onrender.com/api/docs`
- **Postman Collection:** Located in `backend/Taskboard-API.postman_collection.json`

## Testing

Backend unit tests can be executed from the `backend/` directory:

```bash
cd backend
npm run test
```

## Live Deployment Links

- **Frontend App:** [https://taskboard-one-theta.vercel.app](https://taskboard-one-theta.vercel.app)
- **Backend API:** [https://farm-build-your-portfolio-project-2.onrender.com/api](https://farm-build-your-portfolio-project-2.onrender.com/api)

## Technical Assignment Coverage

- **Core Scope:** Registration, login, password hashing, JWT guards, project CRUD, task CRUD, status/priority filtering, responsive frontend, and client-side validation were all completed.
- **Bonus Features Implemented:**
  - Docker Compose orchestration.
  - Swagger OpenAPI documentation.
  - Pagination, text search, and multi-field sorting.
  - Complete Postman API collection.
