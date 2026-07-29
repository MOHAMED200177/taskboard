# Task Management - Taskboard Frontend

A React + Vite frontend for the Taskboard API — a lightweight team task board where authenticated users can create projects, manage tasks, assign them to teammates, and track status changes on a Kanban board.

Built against the [Taskboard NestJS backend](../backend).

---

## Tech Stack

- **React 18** + **Vite** — fast dev server and build
- **React Router v6** — client-side routing and protected routes
- **Axios** — HTTP client with silent access-token refresh on 401
- **Plain CSS design system** (no UI framework) — see `src/index.css`

---

## Features

- **Auth**
  - Login and registration screens with client-side validation
  - Silent session restore on page load (via the refresh-token cookie)
  - Automatic access-token refresh on 401 responses
  - Logout
- **Projects**
  - List, create, edit, and delete projects (admin/creator only)
  - Member management modal (add/remove project members)
- **Tasks**
  - Kanban board (**To Do** / **In Progress** / **Done**) with drag-and-drop status changes
  - Create, edit, and delete tasks
  - Filtering by status, priority, and assignee
- **UX**
  - Loading, empty, and error states on every data view
  - Toast notifications for background actions (create/update/delete)
  - Responsive layout — sidebar collapses to a top bar and the board stacks into a single column on mobile

---

## Project Structure

```
src/
├── api/
│   ├── client.js          # Axios instance, interceptors, token refresh
│   ├── auth.js             # Auth endpoints
│   ├── projects.js         # Project endpoints
│   └── tasks.js             # Task endpoints
├── components/
│   ├── Layout.jsx           # App shell (sidebar/top bar)
│   ├── ProtectedRoute.jsx   # Route guard for authenticated pages
│   ├── ProjectModal.jsx     # Create/edit project form
│   ├── MemberModal.jsx      # Add/remove project members
│   ├── TaskCard.jsx         # Kanban card
│   ├── TaskModal.jsx        # Create/edit task form
│   ├── ConfirmDialog.jsx    # Delete confirmation
│   └── Toast.jsx            # Toast notifications
├── context/
│   └── AuthContext.jsx      # Auth state, current user, session restore
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx        # Project list
│   └── ProjectBoard.jsx     # Kanban board + filters
├── utils.js
├── index.css                # Design tokens + global styles
├── App.jsx                  # Routes
└── main.jsx                 # Entry point
```

---

## Prerequisites

- Node.js >= 18
- The Taskboard backend running (see backend README) — default `http://localhost:3001/api`

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

| Variable       | Description                 | Example                     |
| -------------- | --------------------------- | --------------------------- |
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:3001/api` |

### 3. Run the app

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview
```

The app runs at `http://localhost:3000` by default.

> **Note:** make sure the backend's `FRONTEND_URL` environment variable is set to `http://localhost:3000` so CORS and the refresh-token cookie work correctly, and that the backend is reachable at the URL configured in `VITE_API_URL`.

---

## Test Credentials

Use the same accounts you registered/seeded on the backend, e.g.:

- **Admin:** `admin@test.com` / `Admin1234`
- **Member:** `member@test.com` / `Member1234`

(See the backend README for registration/seed instructions.)

---

## Available Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Build for production into `dist/`    |
| `npm run preview` | Preview the production build locally |

---

## Notes

- Protected routes redirect to `/login` if there is no valid session.
- All API calls automatically attach the access token and retry once with a refreshed token on a 401.
- Only the project admin/creator can edit or delete a project or remove members; task editing is available to admins, the task creator, and the assigned user.
