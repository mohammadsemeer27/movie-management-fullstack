# Movie Management REST API

A RESTful Movie Management System built with Go, PostgreSQL, and Redis.

The application provides movie management, user authentication, role-based authorization, show timings, watch history, and Redis caching.

## Features

- User registration
- User login
- JWT authentication
- Password hashing with bcrypt
- Role-based authorization
- Admin user management
- Create movies
- List movies
- Search movies
- Get movie by ID
- Delete movies
- Create show timings
- View show timings
- Mark movies as watched
- View user's watch history
- PostgreSQL database
- Redis caching
- Cache invalidation after movie changes
- Environment-based configuration

## Tech Stack

- Go
- net/http
- PostgreSQL
- Redis
- JWT
- bcrypt
- godotenv

## Project Structure

```text
movie-management/
│
├── main.go
├── go.mod
├── go.sum
├── .env
├── .gitignore
│
├── database/
│   └── postgres.go
│
└── cache/
    └── redis.go
