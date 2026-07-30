# Task Management API

This is the backend for the Task Management application, providing a secure, scalable RESTful API to handle users, projects, tasks, and role-based access control.

## Project Overview

The backend is built using **NestJS** and **PostgreSQL**. It enforces robust business logic including strict role-based data boundaries (users can only access projects they belong to), secure password hashing, and stateless JWT authentication with short-lived access tokens and httpOnly refresh cookies. 

## Features

- **Authentication:** Registration, Login, Logout (single & all devices), Password Change, and Password Recovery.
- **JWT Flow:** Secure HTTP-only refresh tokens and short-lived access tokens.
- **Role-Based Access Control:** Differentiates between Project Admins (creators) and Members.
- **Projects & Tasks:** Full CRUD operations for projects and tasks with relational integrity.
- **Filtering & Search:** Built-in endpoints for querying tasks by status, priority, assignee, and search terms.
- **Validation:** Strict incoming request validation and sanitization using `class-validator`.
- **API Documentation:** Auto-generated Swagger documentation.

## Tech Stack

- **Framework:** NestJS (Node.js)
- **Database:** PostgreSQL
- **ORM:** TypeORM
- **Authentication:** Passport, JWT, bcryptjs
- **Testing:** Jest, Supertest
- **Containerization:** Docker

## Project Structure

```
backend/
├── src/
│   ├── auth/         # Authentication and session management
│   ├── database/     # TypeORM configurations and migrations
│   ├── projects/     # Project and member management modules
│   ├── tasks/        # Task creation, assignment, and filtering
│   ├── users/        # User entity and core profile logic
│   ├── app.module.ts # Main application module
│   └── main.ts       # Application bootstrap
├── test/             # End-to-end (e2e) tests
├── Dockerfile        # Production Docker configuration
└── package.json      # Dependencies and scripts
```

## Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=taskboard
DATABASE_SSL=false

# Authentication
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

## Installation

```bash
npm install
```

## Running Locally

To run the server in development mode:

```bash
npm run start:dev
```
The server will start at `http://localhost:3001`.

## Running with Docker

You can containerize the backend or run it alongside the database via Docker Compose from the root directory.
To build and run just the backend image:

```bash
docker build -t taskboard-backend .
docker run -p 3001:3001 --env-file .env taskboard-backend
```

## API Documentation (Swagger)

When the server is running, the interactive Swagger API documentation is automatically generated and accessible at:
- **Local:** `http://localhost:3001/api/docs`
- **Production:** `https://farm-build-your-portfolio-project-2.onrender.com/api/docs`

## Authentication Overview

The API implements a dual-token JWT architecture:
1. **Access Token:** Returned in the JSON body upon login. Sent by the client in the `Authorization: Bearer <token>` header.
2. **Refresh Token:** Sent automatically to the client as an `httpOnly` secure cookie. Used to seamlessly fetch new access tokens without exposing the refresh mechanism to JavaScript.

## Testing

The backend includes a comprehensive suite of automated tests verifying core logic and security boundaries.

```bash
# Run unit tests
npm run test

# Run tests with watch mode
npm run test:watch

# Run test coverage report
npm run test:cov
```

## Deployment

The production API is currently deployed and hosted at:
**[https://farm-build-your-portfolio-project-2.onrender.com](https://farm-build-your-portfolio-project-2.onrender.com)**
