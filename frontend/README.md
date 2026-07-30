# Task Management Frontend

A responsive web application for project and task management built with React and Vite, styled using a custom Black & Emerald design system.

## Overview

The frontend interacts with the RESTful NestJS API to provide real-time form validation, session management with silent JWT rotation, project management, and a task board with search, filtering, and pagination capabilities.

## Tech Stack

- **Library:** React 18
- **Build Tool:** Vite 5
- **Routing:** React Router v6
- **HTTP Client:** Axios 1.7
- **Styling:** Custom Vanilla CSS

## Features

- **Authentication UX:** Login, registration with password rule checklists, password visibility toggles, change password, and reset password flows.
- **Session Handling:** Automatic token rotation via Axios response interceptors on 401 Unauthorized responses.
- **Projects Management:** Create projects, update project details, view team members, and add/remove project members by User ID.
- **Task Management:** Create, edit, and delete tasks within projects.
- **Filters & Search:** Filter by status (To Do, In Progress, Done), priority (Low, Medium, High), search by text, and sort by fields.

## Project Structure

```
frontend/
├── src/
│   ├── api/            # Axios client setup and interceptors
│   ├── components/     # Modals (ProjectModal, TaskModal, MemberModal), Layout, ProtectedRoute
│   ├── context/        # AuthContext provider
│   ├── pages/          # Login, Register, Dashboard, ProjectBoard
│   ├── utils.js        # Helper functions
│   ├── index.css       # Design tokens and styles
│   ├── App.jsx         # App routes
│   └── main.jsx        # Entry point
├── index.html
├── vite.config.js
├── Dockerfile          # NGINX production container
└── package.json
```

## Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:3001/api
```

## Installation & Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start Vite development server:
   ```bash
   npm run dev
   ```
   App running at `http://localhost:3000`

3. Production build:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

## Deployment

- **Live App URL:** `https://taskboard-one-theta.vercel.app`
- **Target Backend API:** `https://farm-build-your-portfolio-project-2.onrender.com/api`
