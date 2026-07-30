# Task Management Frontend

This is the frontend application for the Task Management platform. It provides a sleek, responsive, and premium UI built on a modern Black & Emerald design system.

## Project Overview

The application is built using **React** and **Vite**. It interacts securely with the backend API, offering real-time user validation, protected routing, dynamic search and filtering, and comprehensive state management without relying on heavy external state libraries. 

## Features

- **Premium Design:** Clean, modern interface emphasizing a Black & Emerald palette.
- **Authentication:** Full login, registration, and password recovery flows with live client-side validation and password strength checklists.
- **Silent Token Refresh:** Built-in Axios interceptors seamlessly rotate JWTs in the background.
- **Project Dashboard:** Create, manage, and view assigned projects.
- **Kanban Task Board:** Visualize, filter, and organize tasks efficiently.
- **Dynamic Search & Filtering:** Debounced searching and sorting by status/priority.
- **Responsive:** Fully optimized for both desktop and mobile devices.

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router (v6)
- **HTTP Client:** Axios
- **Styling:** Vanilla CSS (Custom Design System)

## Project Structure

```
frontend/
├── src/
│   ├── api/          # Axios instance and API interceptors
│   ├── components/   # Reusable UI components (Modals, Layout, ProtectedRoute)
│   ├── context/      # Global state providers (AuthContext)
│   ├── pages/        # Main application views (Dashboard, Login, Register)
│   ├── index.css     # Global design system variables and tokens
│   └── main.jsx      # Application entry point
├── index.html        # HTML template
├── vite.config.js    # Vite configuration
└── Dockerfile        # Production NGINX configuration
```

## Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# The URL to the Backend API
VITE_API_URL=http://localhost:3001/api
```

## Installation

```bash
npm install
```

## Running Locally

To start the Vite development server:

```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Build Instructions

To bundle the application for production:

```bash
npm run build
```
This will compile and minify the assets into the `dist/` folder. You can preview the production build locally using `npm run preview`.

## Deployment

The frontend is deployed as a static Single Page Application (SPA).

- **Live URL:** **[https://taskboard-one-theta.vercel.app](https://taskboard-one-theta.vercel.app)**
- **Backend Target:** It points to the live backend API at `https://farm-build-your-portfolio-project-2.onrender.com/api`
