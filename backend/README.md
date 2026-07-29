# Task Management API

A production-ready task management backend built with NestJS, PostgreSQL, and TypeORM. Supports project-based task tracking with role-based access control, JWT authentication, and refresh token rotation.

---

## Tech Stack

- **Backend:** NestJS + TypeScript
- **Database:** PostgreSQL + TypeORM
- **Auth:** JWT (Access + Refresh tokens with rotation)
- **Validation:** class-validator + class-transformer
- **Docs:** Swagger / OpenAPI
- **Testing:** Jest

---

## Features

- JWT authentication with refresh token rotation & device tracking
- Account lockout after 5 failed login attempts
- Role-based access control (Admin / Member)
- Project management with member access control
- Task management with filtering by status, priority, and assignee
- Centralized error handling
- Swagger documentation at `/api/docs`

---

## Project Structure

```
src/
├── auth/
│   ├── decorators/         # CurrentUser, Roles decorators
│   ├── dto/                # Login, Register, ChangePassword, ForgotPassword, ResetPassword
│   ├── guards/             # JwtAuthGuard, JwtRefreshGuard, RolesGuard
│   ├── strategies/         # JWT and JWT Refresh Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── refresh-token.entity.ts
├── projects/
│   ├── dto/                # CreateProject, UpdateProject, AddMember
│   ├── project.entity.ts
│   ├── projects.controller.ts
│   ├── projects.service.ts
│   └── projects.module.ts
├── tasks/
│   ├── dto/                # CreateTask, UpdateTask, FilterTask
│   ├── task.entity.ts
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   └── tasks.module.ts
├── users/
│   └── user.entity.ts
├── common/
│   └── filters/
│       └── http-exception.filter.ts
├── app.module.ts
└── main.ts
```

---

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm

---

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd task-management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in the values in `.env` (see [Environment Variables](#environment-variables) below).

### 4. Create the database

```bash
psql -U postgres -c "CREATE DATABASE taskboard;"
```

### 5. Run the application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at: `http://localhost:3001/api`  
Swagger docs at: `http://localhost:3001/api/docs`

---

## Environment Variables

| Variable             | Description               | Example                 |
| -------------------- | ------------------------- | ----------------------- |
| `PORT`               | Port the server runs on   | `3001`                  |
| `NODE_ENV`           | Environment               | `development`           |
| `DATABASE_HOST`      | PostgreSQL host           | `localhost`             |
| `DATABASE_PORT`      | PostgreSQL port           | `5432`                  |
| `DATABASE_USER`      | PostgreSQL username       | `postgres`              |
| `DATABASE_PASSWORD`  | PostgreSQL password       | `yourpassword`          |
| `DATABASE_NAME`      | PostgreSQL database name  | `taskboard`             |
| `JWT_ACCESS_SECRET`  | Secret for access tokens  | `your_access_secret`    |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | `your_refresh_secret`   |
| `FRONTEND_URL`       | Allowed CORS origin       | `http://localhost:3000` |

---

## API Overview

### Auth — `/api/auth`

| Method | Endpoint           | Auth   | Description                 |
| ------ | ------------------ | ------ | --------------------------- |
| POST   | `/register`        | Public | Register a new user         |
| POST   | `/login`           | Public | Login and receive tokens    |
| POST   | `/refresh`         | Cookie | Refresh access token        |
| POST   | `/logout`          | Bearer | Logout current device       |
| POST   | `/logout-all`      | Bearer | Logout all devices          |
| GET    | `/me`              | Bearer | Get current user profile    |
| POST   | `/change-password` | Bearer | Change password             |
| POST   | `/forgot-password` | Public | Request password reset code |
| POST   | `/reset-password`  | Public | Reset password with code    |

### Projects — `/api/projects`

| Method | Endpoint               | Auth   | Description                       |
| ------ | ---------------------- | ------ | --------------------------------- |
| POST   | `/`                    | Bearer | Create a project                  |
| GET    | `/`                    | Bearer | List projects you are a member of |
| GET    | `/:id`                 | Bearer | Get a single project              |
| PATCH  | `/:id`                 | Bearer | Update project (Admin only)       |
| DELETE | `/:id`                 | Bearer | Delete project (Admin only)       |
| POST   | `/:id/members`         | Bearer | Add a member (Admin only)         |
| DELETE | `/:id/members/:userId` | Bearer | Remove a member (Admin only)      |

### Tasks — `/api/projects/:projectId/tasks`

| Method | Endpoint   | Auth   | Description                                     |
| ------ | ---------- | ------ | ----------------------------------------------- |
| POST   | `/`        | Bearer | Create a task                                   |
| GET    | `/`        | Bearer | List tasks (filter by status/priority/assignee) |
| GET    | `/:taskId` | Bearer | Get a single task                               |
| PATCH  | `/:taskId` | Bearer | Update task (Admin / creator / assignee)        |
| DELETE | `/:taskId` | Bearer | Delete task (Admin / creator only)              |

Full interactive documentation is available at `/api/docs`.

---

## Roles

| Role     | Capabilities                                                               |
| -------- | -------------------------------------------------------------------------- |
| `admin`  | Full access: manage projects, members, and all tasks within their projects |
| `member` | Can create tasks, edit tasks they created or are assigned to               |

> **Note:** The `admin` role is a platform-level role set at registration. Project-level admin is determined by who created the project.

---

## Running Tests

```bash
# Run all tests
npm test

# With coverage
npm run test:cov
```

Tests cover:

- Registration conflict on duplicate email
- Successful registration
- Login failure on wrong password
- Login failure on locked account
- Project update forbidden for non-admin
- Removing project creator from members is forbidden
- Non-member cannot access a project

---

## Seed / Test Credentials

Since the app uses `synchronize: true` in development, tables are created automatically on first run.

Register an Admin account:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin User", "email": "admin@test.com", "password": "Admin1234", "role": "admin"}'
```

Register a Member account:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Member User", "email": "member@test.com", "password": "Member1234"}'
```

---

## Notes

- Refresh tokens are stored hashed in the database and rotated on every use.
- Account lockout triggers after 5 consecutive failed login attempts (30-minute lock).
- All routes under `/api/projects` and `/api/projects/:id/tasks` require a valid Bearer token.
- Tasks can only be assigned to users who are members of the project.
