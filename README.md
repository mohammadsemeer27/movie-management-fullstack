# 🎬 Movie Management System

A full-stack Movie Management System built with React, Vite, Tailwind CSS, Golang, PostgreSQL, Redis, and JWT Authentication.

The application allows users to browse movies, search movies, view movie details and show timings, maintain watch history, while administrators can manage movies, users, and show timings through a protected Admin Dashboard.

## 🌐 Live Demo

🚀 **Movie Management System:**  
https://movie-management-fullstack.vercel.app

🔗 **GitHub Repository:**  
https://github.com/mohammadsemeer27/movie-management-fullstack

---

## 📌 Project Overview

The Movie Management System is a full-stack web application designed to manage movies, users, show timings, and watch history.

The application provides separate functionality for normal users and administrators.

Users can browse and search movies, view movie information, check show timings, mark movies as watched, and view their watch history.

Administrators can manage movies, users, and show timings through a protected Admin Dashboard.

---

## ✨ Features

### 👤 User Features

- User registration
- User login
- JWT-based authentication
- Secure password hashing using bcrypt
- Browse movies
- Search movies
- View movie details
- View show timings
- Mark movies as watched
- View personal watch history
- View user profile
- Logout functionality
- Responsive user interface

### 🔐 Admin Features

- Protected Admin Dashboard
- Admin authentication
- View total movies
- View total users
- View all registered users
- Add new movies
- Delete movies
- Add show timings
- Manage movie information
- Manage show schedules

### ⚡ Performance & Security

- Redis caching for movie data
- PostgreSQL database
- JWT authentication
- bcrypt password hashing
- Role-based authorization
- Admin-only protected endpoints
- CORS configuration
- Environment variable configuration

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- React Hot Toast
- Lucide React

### Backend

- Golang
- net/http
- REST API
- JWT
- bcrypt

### Database

- PostgreSQL

### Cache

- Redis / Valkey

### Deployment

- Vercel
- Render
- PostgreSQL
- Redis / Valkey

### Development Tools

- Git
- GitHub
- Linux
- VS Code

---

## 🏗️ Project Architecture

```text
                    Movie Management System
                              │
               ┌──────────────┴──────────────┐
               │                             │
          React Frontend                Go Backend
               │                             │
               │                       REST API
               │                             │
               │                ┌────────────┴────────────
               │                │                         │
               │          PostgreSQL                  Redis
               │                │                         │
               └────────────────┴─────────────────────────┘


movie-management-fullstack/
│
├── backend/
│   ├── cache/
│   │   └── redis.go
│   │
│   ├── database/
│   │   └── postgres.go
│   │
│   ├── main.go
│   ├── go.mod
│   ├── go.sum
│   └── .env
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   │
│   │   ├── components/
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Admin.jsx
│   │   │   └── WatchHistory.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
