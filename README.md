
# 🎬 Movie Management System

A full-stack Movie Management System built with **React, Vite, Go, PostgreSQL, Redis, and JWT authentication**.

The application allows users to browse and search movies, view show timings, maintain watch history, and securely authenticate. Administrators can manage movies, show timings, and users through a dedicated admin dashboard.

---

## ✨ Features

### 👤 User Features

- User registration
- User login and JWT authentication
- Browse all movies
- Search movies
- View movie details
- View available show timings
- Mark movies as watched
- View personal watch history
- Secure logout
- Responsive UI
- Toast notifications

### 🛠️ Admin Features

- Admin authentication
- Admin dashboard
- View total movies and users
- Add movies
- Delete movies
- Add movie show timings
- View all registered users
- Role-based access control

### ⚡ Performance & Security

- PostgreSQL database
- Redis caching for movie data
- JWT-based authentication
- Password hashing using bcrypt
- Protected admin routes
- Protected user routes
- Environment variables for sensitive configuration
- RESTful API architecture

---

## 🧰 Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- React Router
- React Hot Toast
- Lucide React

### Backend

- Go
- REST API
- PostgreSQL
- Redis
- JWT
- bcrypt
- godotenv

### Development Tools

- Git
- GitHub
- VS Code
- Postman / cURL

---

## 🏗️ Project Structure

```text
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
│   ├── .env
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ShowTimingManager.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── pages/
│   │       ├── Admin.jsx
│   │       ├── Home.jsx
│   │       ├── Login.jsx
│   │       ├── MovieDetails.jsx
│   │       ├── Profile.jsx
│   │       └── Register.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
