# Task Management Backend API

Provides a secure RESTful API for user authentication, project management, task tracking, and role-based authorization.

## Overview

The backend is built with NestJS and PostgreSQL (via TypeORM). It implements role-based access control, secure password hashing with bcryptjs, and a dual-token JWT authentication flow (short-lived access tokens and httpOnly refresh cookies).

## Tech Stack

- **Framework:** NestJS 11
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Authentication:** Passport-JWT, bcryptjs
- **Validation:** class-validator, class-transformer
- **Documentation:** Swagger UI (`@nestjs/swagger`)
- **Testing:** Jest, Supertest

## Architecture & Modules

- **AuthModule (`src/auth`):** Handles registration, login, token refresh, password recovery, password change, and session logout (single and all devices).
- **ProjectsModule (`src/projects`):** Manages project lifecycle, project ownership (admin role), and member assignments.
- **TasksModule (`src/tasks`):** Manages task CRUD operations, assignment bounds, status/priority filtering, debounced searching, sorting, and pagination.
- **UsersModule (`src/users`):** User entity definitions and profile queries.

## Project Structure

```
backend/
├── src/
│   ├── auth/           # Authentication controllers, services, strategies, guards, DTOs
│   ├── database/       # Data source configuration, seeds, and migrations
│   ├── projects/       # Projects controller, service, entity, DTOs
│   ├── tasks/          # Tasks controller, service, entity, DTOs
│   ├── users/          # User entity and services
│   ├── app.module.ts   # Root application module
│   └── main.ts         # Application entry point & Swagger configuration
├── test/               # End-to-end test suite
├── Taskboard-API.postman_collection.json # API Postman collection
├── Dockerfile          # Multi-stage Docker build
└── package.json
```

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=taskboard
DATABASE_SSL=false

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

## Installation & Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run start:dev
   ```
   API running at `http://localhost:3001/api`

## Running with Docker

```bash
docker build -t taskboard-backend .
docker run -p 3001:3001 --env-file .env taskboard-backend
```

## API Documentation (Swagger)

Swagger UI is available when the backend is running:
- **Local:** `http://localhost:3001/api/docs`
- **Deployed:** `https://farm-build-your-portfolio-project-2.onrender.com/api/docs`

## Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run coverage report
npm run test:cov
```

## Deployment

- **Live API URL:** `https://farm-build-your-portfolio-project-2.onrender.com`
