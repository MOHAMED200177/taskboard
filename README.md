# Project Overview

Task Management is a production-minded Full Stack Application designed to help teams efficiently organize, track, and collaborate on projects and tasks. It provides a secure environment where project administrators can manage team membership and delegate work while ensuring that all users only see the data they are authorized to access. 

# About This Project

This project was built as a robust, scalable Task Management Application based on a rigorous technical assignment. It focuses heavily on security, clean architecture, and modern UX design, fulfilling all core requirements while incorporating professional engineering practices like stateless JWT architecture, containerization, and automated testing.

# Features

- **Authentication:** Secure registration, login, and password management flows.
- **Authorization:** Granular role-based access control protecting resources at the database query level.
- **Project Management:** Create, update, and manage workspaces efficiently.
- **Task Management:** Full task lifecycle control with assignments, statuses, priorities, and deadlines.
- **Member Management:** Project admins can seamlessly invite and remove team members.
- **Dashboard:** A central view for quickly parsing workload and project health.
- **Search:** Real-time debounced search to quickly locate specific tasks.
- **Filtering & Sorting:** Filter tasks by status and priority; sort them by various parameters.
- **Pagination:** Backend-driven pagination for handling large volumes of tasks efficiently.
- **Responsive UI:** A premium "Black & Emerald" interface built to work flawlessly on both desktop and mobile.
- **JWT Authentication:** Implements a dual-token system (short-lived Access Tokens and `httpOnly` Refresh Tokens).
- **Refresh Token Flow:** Axios interceptors on the frontend automatically rotate sessions seamlessly.
- **Validation:** Both frontend live validation and strict backend DTO sanitization via `class-validator`.
- **Error Handling:** Centralized exception filters to catch and translate errors into user-friendly responses.
- **Docker:** Fully containerized setup for easy deployments and identical local development environments.
- **Swagger:** Auto-generated API documentation accessible in-browser.
- **Automated Tests:** Comprehensive unit and integration test coverage across core backend services.

# Technology Stack

- **Frontend:** React 18, Vite, React Router, Axios, Custom Vanilla CSS Design System.
- **Backend:** NestJS, TypeScript.
- **Database:** PostgreSQL via TypeORM.
- **Authentication:** Passport, JWT, bcryptjs.
- **Testing:** Jest, Supertest.
- **Containerization:** Docker & Docker Compose.
- **Deployment:** Render (Backend), Vercel (Frontend), Neon (Cloud PostgreSQL).

# Architecture

The application operates as a decoupled Single Page Application (SPA) communicating with a REST API. 

- **Frontend to Backend:** The React client utilizes an Axios instance configured to send credentials (`httpOnly` cookies). 
- **Authentication Flow:** Upon login, the server returns an access token in the JSON payload (kept in memory) and sets a secure `httpOnly` refresh token cookie. If an API request fails with a `401 Unauthorized`, the frontend intercepts it, calls the `/auth/refresh` endpoint using the cookie, securely updates the access token, and transparently replays the failed request.
- **Role-Based Access:** Every project inherently assigns its creator as the "Admin". Admins have full control over the project's metadata, members, and task deletions. Regular members can view the project and update tasks assigned to them.
- **Relational Integrity:** Projects own Tasks and associate with Users (Members). The backend enforces strict authorization checks before permitting any CRUD operation, ensuring data boundaries remain absolute.

# Folder Structure

```
taskboard/
├── backend/            # NestJS Application
│   ├── src/            # Core business logic and controllers
│   ├── test/           # e2e testing directory
│   ├── Dockerfile      # Backend container config
│   └── package.json    # Backend dependencies
├── frontend/           # React/Vite Application
│   ├── src/            # UI Components, Pages, and API services
│   ├── Dockerfile      # NGINX container config for the static build
│   └── package.json    # Frontend dependencies
├── docker-compose.yml  # Orchestrates the DB, Backend, and Frontend locally
└── README.md           # Project documentation (You are here)
```

# Installation

## Running Locally (Native)

1. **Clone the repository.**
2. **Setup the Database:** Ensure you have PostgreSQL running locally or a cloud instance.
3. **Backend Setup:**
   - `cd backend`
   - Copy `.env.example` to `.env` and configure your database and JWT secrets.
   - Run `npm install` followed by `npm run start:dev`.
4. **Frontend Setup:**
   - `cd frontend`
   - Copy `.env.example` to `.env` (ensure `VITE_API_URL` points to the backend).
   - Run `npm install` followed by `npm run dev`.

## Running with Docker

To spin up the entire stack (Database, Backend API, and Frontend web server) identically in one command:

1. Copy `.env.example` to `.env` in the root (if provided) or ensure your backend `.env` is configured.
2. Ensure Docker Desktop is running.
3. From the root directory, run:
   ```bash
   docker compose up --build
   ```
4. Access the frontend at `http://localhost:3000` and the API at `http://localhost:3001/api`.

# Environment Variables

## Backend (`backend/.env`)
- `NODE_ENV`: Application environment (e.g., `development`, `production`).
- `PORT`: Server port (default: 3001).
- `FRONTEND_URL`: CORS origin mapping.
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`: PostgreSQL connection details.
- `DATABASE_SSL`: Set to `true` if using a hosted database like Neon, `false` for local Docker.
- `JWT_SECRET`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: Secure keys for token signing.
- `JWT_EXPIRES_IN`: Lifespan configuration.

## Frontend (`frontend/.env`)
- `VITE_API_URL`: The full URL to the backend API (e.g., `http://localhost:3001/api`).

# API Documentation

The backend exposes an interactive Swagger (OpenAPI) interface. You can access it by running the backend and navigating to `/api/docs`. 
- **Local:** `http://localhost:3001/api/docs`
- **Live:** `https://farm-build-your-portfolio-project-2.onrender.com/api/docs`

# Live Demo

- **Frontend:** [https://taskboard-one-theta.vercel.app](https://taskboard-one-theta.vercel.app)
- **Backend API:** [https://farm-build-your-portfolio-project-2.onrender.com](https://farm-build-your-portfolio-project-2.onrender.com)

# Testing

To run the automated backend test suite, navigate to the `backend/` directory:

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch
```
The tests execute strict checks against the core authentication, project, and task services to verify logic and role boundaries.

# Assignment Coverage

This implementation satisfies all requirements specified in the original technical assignment. 

- **All core requirements were completed successfully:** Authentication (JWT, hashing), Project CRUD and membership boundaries, Task CRUD with advanced filtering and statuses, and a comprehensive frontend UI mapping 1:1 with the requested functionality.
- **Optional Bonus Features Implemented:** 
  - Docker Compose orchestration.
  - Swagger/OpenAPI documentation.
  - Pagination, Search, and Sorting on Task lists.


