package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"movie-management/cache"
	"movie-management/database"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

type Claims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

var jwtSecret []byte

// =========================
// Movie
// =========================

type Movie struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Genre    string `json:"genre"`
	Language string `json:"language"`
	Duration int    `json:"duration"`
}

// =========================
// Show Timing
// =========================

type ShowTiming struct {
	ID       int    `json:"id"`
	MovieID  int    `json:"movie_id"`
	ShowTime string `json:"show_time"`
	Screen   string `json:"screen"`
}

type CreateShowTimingRequest struct {
	ShowTime string `json:"show_time"`
	Screen   string `json:"screen"`
}

// =========================
// User
// =========================

type User struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	CreatedAt string `json:"created_at"`
}

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Message string `json:"message"`
	User    User   `json:"user"`
}

type contextKey string

const (
	userIDKey contextKey = "userID"
	roleKey   contextKey = "role"
)

// =========================
// GET /movies
// =========================

func moviesHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		// =========================
		// Check Redis Cache
		// =========================

		cachedMovies, err := cache.Get("movies:all")

		if err == nil {
			fmt.Println("Redis cache HIT")

			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte(cachedMovies))
			return
		}

		fmt.Println("Redis cache MISS")

		// =========================
		// Fetch from PostgreSQL
		// =========================

		rows, err := db.Query(`
			SELECT id, title, genre, language, duration
			FROM movies
			ORDER BY id
		`)

		if err != nil {
			http.Error(
				w,
				"Failed to fetch movies",
				http.StatusInternalServerError,
			)
			return
		}

		defer rows.Close()

		var movies []Movie

		for rows.Next() {

			var movie Movie

			err := rows.Scan(
				&movie.ID,
				&movie.Title,
				&movie.Genre,
				&movie.Language,
				&movie.Duration,
			)

			if err != nil {
				http.Error(
					w,
					"Failed to read movie",
					http.StatusInternalServerError,
				)
				return
			}

			movies = append(movies, movie)
		}

		if err := rows.Err(); err != nil {
			http.Error(
				w,
				"Failed to read movies",
				http.StatusInternalServerError,
			)
			return
		}

		// =========================
		// Convert movies to JSON
		// =========================

		jsonData, err := json.Marshal(movies)

		if err != nil {
			http.Error(
				w,
				"Failed to encode movies",
				http.StatusInternalServerError,
			)
			return
		}

		// =========================
		// Store in Redis
		// =========================

		err = cache.Set(
			"movies:all",
			string(jsonData),
			5*time.Minute,
		)

		if err != nil {
			fmt.Println("Failed to save movies to Redis:", err)
		} else {
			fmt.Println("Movies saved to Redis")
		}

		// =========================
		// Send Response
		// =========================

		w.Header().Set("Content-Type", "application/json")

		w.Write(jsonData)
	}
}

// =========================
// POST /movies
// =========================
func createMovieHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		var movie Movie

		err := json.NewDecoder(r.Body).Decode(&movie)

		if err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		// =========================
		// Create movie in PostgreSQL
		// =========================

		err = db.QueryRow(`
			INSERT INTO movies (title, genre, language, duration)
			VALUES ($1, $2, $3, $4)
			RETURNING id
		`,
			movie.Title,
			movie.Genre,
			movie.Language,
			movie.Duration,
		).Scan(&movie.ID)

		if err != nil {
			http.Error(
				w,
				"Failed to create movie",
				http.StatusInternalServerError,
			)
			return
		}

		// =========================
		// Invalidate Redis Cache
		// =========================

		err = cache.Delete("movies:all")

		if err != nil {
			fmt.Println("Failed to delete movies cache:", err)
		} else {
			fmt.Println("Movies cache deleted")
		}

		// =========================
		// Send Response
		// =========================

		w.Header().Set("Content-Type", "application/json")

		w.WriteHeader(http.StatusCreated)

		json.NewEncoder(w).Encode(movie)
	}
}

// =========================
// GET /movies/:id
// DELETE /movies/:id
// =========================

func getMovieHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if r.Method == http.MethodDelete {
			deleteMovieHandler(db)(w, r)
			return
		}

		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")

		if len(parts) != 2 || parts[0] != "movies" {
			http.Error(w, "Invalid URL", http.StatusBadRequest)
			return
		}

		id, err := strconv.Atoi(parts[1])

		if err != nil {
			http.Error(w, "Invalid movie ID", http.StatusBadRequest)
			return
		}

		var movie Movie

		err = db.QueryRow(`
			SELECT id, title, genre, language, duration
			FROM movies
			WHERE id = $1
		`, id).Scan(
			&movie.ID,
			&movie.Title,
			&movie.Genre,
			&movie.Language,
			&movie.Duration,
		)

		if err == sql.ErrNoRows {
			http.Error(w, "Movie not found", http.StatusNotFound)
			return
		}

		if err != nil {
			http.Error(w, "Failed to fetch movie", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(movie)
	}
}

// =========================
// DELETE /movies/:id
// =========================

func deleteMovieHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")

		if len(parts) != 2 || parts[0] != "movies" {
			http.Error(w, "Invalid URL", http.StatusBadRequest)
			return
		}

		id, err := strconv.Atoi(parts[1])

		if err != nil {
			http.Error(w, "Invalid movie ID", http.StatusBadRequest)
			return
		}

		// =========================
		// Delete movie from PostgreSQL
		// =========================

		result, err := db.Exec(`
			DELETE FROM movies
			WHERE id = $1
		`, id)

		if err != nil {
			http.Error(
				w,
				"Failed to delete movie",
				http.StatusInternalServerError,
			)
			return
		}

		rowsAffected, err := result.RowsAffected()

		if err != nil {
			http.Error(
				w,
				"Failed to check deletion",
				http.StatusInternalServerError,
			)
			return
		}

		if rowsAffected == 0 {
			http.Error(
				w,
				"Movie not found",
				http.StatusNotFound,
			)
			return
		}

		// =========================
		// Invalidate Redis Cache
		// =========================

		err = cache.Delete("movies:all")

		if err != nil {
			fmt.Println("Failed to delete movies cache:", err)
		} else {
			fmt.Println("Movies cache deleted")
		}

		// =========================
		// Send Response
		// =========================

		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(map[string]string{
			"message": "Movie deleted successfully",
		})
	}
}

// =========================
// GET /movies/search
// =========================

func searchMoviesHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		title := r.URL.Query().Get("title")
		genre := r.URL.Query().Get("genre")
		language := r.URL.Query().Get("language")

		query := `
			SELECT id, title, genre, language, duration
			FROM movies
			WHERE
				($1 = '' OR title ILIKE '%' || $1 || '%')
				AND ($2 = '' OR genre ILIKE '%' || $2 || '%')
				AND ($3 = '' OR language ILIKE '%' || $3 || '%')
			ORDER BY id
		`

		rows, err := db.Query(query, title, genre, language)

		if err != nil {
			http.Error(w, "Failed to search movies", http.StatusInternalServerError)
			return
		}

		defer rows.Close()

		var movies []Movie

		for rows.Next() {

			var movie Movie

			err := rows.Scan(
				&movie.ID,
				&movie.Title,
				&movie.Genre,
				&movie.Language,
				&movie.Duration,
			)

			if err != nil {
				http.Error(w, "Failed to read movie", http.StatusInternalServerError)
				return
			}

			movies = append(movies, movie)
		}

		if err := rows.Err(); err != nil {
			http.Error(w, "Failed to read search results", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(movies)
	}
}

// =========================
// GET /movies/:id/show-times
// =========================

func showTimingsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")

		if len(parts) != 3 ||
			parts[0] != "movies" ||
			parts[2] != "show-times" {

			http.Error(w, "Invalid URL", http.StatusBadRequest)
			return
		}

		movieID, err := strconv.Atoi(parts[1])

		if err != nil {
			http.Error(w, "Invalid movie ID", http.StatusBadRequest)
			return
		}

		rows, err := db.Query(`
			SELECT id, movie_id, show_time, screen
			FROM show_timings
			WHERE movie_id = $1
			ORDER BY show_time
		`, movieID)

		if err != nil {
			http.Error(w, "Failed to fetch show timings", http.StatusInternalServerError)
			return
		}

		defer rows.Close()

		var timings []ShowTiming

		for rows.Next() {

			var timing ShowTiming

			err := rows.Scan(
				&timing.ID,
				&timing.MovieID,
				&timing.ShowTime,
				&timing.Screen,
			)

			if err != nil {
				http.Error(w, "Failed to read show timing", http.StatusInternalServerError)
				return
			}

			timings = append(timings, timing)
		}

		if err := rows.Err(); err != nil {
			http.Error(w, "Failed to read show timings", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(timings)
	}
}

// =========================
// POST /movies/:id/show-times
// =========================

func createShowTimingHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")

		if len(parts) != 3 ||
			parts[0] != "movies" ||
			parts[2] != "show-times" {

			http.Error(w, "Invalid URL", http.StatusBadRequest)
			return
		}

		movieID, err := strconv.Atoi(parts[1])

		if err != nil {
			http.Error(w, "Invalid movie ID", http.StatusBadRequest)
			return
		}

		// Check whether movie exists
		var exists bool

		err = db.QueryRow(`
			SELECT EXISTS(
				SELECT 1
				FROM movies
				WHERE id = $1
			)
		`, movieID).Scan(&exists)

		if err != nil {
			http.Error(w, "Failed to check movie", http.StatusInternalServerError)
			return
		}

		if !exists {
			http.Error(w, "Movie not found", http.StatusNotFound)
			return
		}

		// Read JSON
		var request CreateShowTimingRequest

		err = json.NewDecoder(r.Body).Decode(&request)

		if err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		// Validate input
		if request.ShowTime == "" || request.Screen == "" {
			http.Error(
				w,
				"show_time and screen are required",
				http.StatusBadRequest,
			)
			return
		}

		// Insert show timing
		var timing ShowTiming

		err = db.QueryRow(`
			INSERT INTO show_timings (movie_id, show_time, screen)
			VALUES ($1, $2, $3)
			RETURNING id, movie_id, show_time, screen
		`,
			movieID,
			request.ShowTime,
			request.Screen,
		).Scan(
			&timing.ID,
			&timing.MovieID,
			&timing.ShowTime,
			&timing.Screen,
		)

		if err != nil {
			http.Error(
				w,
				"Failed to create show timing",
				http.StatusInternalServerError,
			)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		w.WriteHeader(http.StatusCreated)

		json.NewEncoder(w).Encode(timing)
	}
}

// =========================
// POST /auth/register
// =========================

func registerHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Read JSON
		var request RegisterRequest

		err := json.NewDecoder(r.Body).Decode(&request)

		if err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		// Validate input
		if request.Name == "" ||
			request.Email == "" ||
			request.Password == "" {

			http.Error(
				w,
				"Name, email and password are required",
				http.StatusBadRequest,
			)
			return
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword(
			[]byte(request.Password),
			bcrypt.DefaultCost,
		)

		if err != nil {
			http.Error(
				w,
				"Failed to hash password",
				http.StatusInternalServerError,
			)
			return
		}

		// Insert user
		var user User

		err = db.QueryRow(`
			INSERT INTO users (name, email, password)
			VALUES ($1, $2, $3)
			RETURNING id, name, email, role, created_at
		`,
			request.Name,
			request.Email,
			string(hashedPassword),
		).Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&user.Role,
			&user.CreatedAt,
		)

		if err != nil {
			// Temporary detailed error for debugging
			http.Error(
				w,
				"Failed to create user: "+err.Error(),
				http.StatusInternalServerError,
			)
			return
		}

		// Return user
		w.Header().Set("Content-Type", "application/json")

		w.WriteHeader(http.StatusCreated)

		json.NewEncoder(w).Encode(user)
	}
}

func loginHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Read JSON request
		var request LoginRequest

		err := json.NewDecoder(r.Body).Decode(&request)
		if err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		// Validate input
		if request.Email == "" || request.Password == "" {
			http.Error(
				w,
				"Email and password are required",
				http.StatusBadRequest,
			)
			return
		}

		// Find user by email
		var user User
		var hashedPassword string

		err = db.QueryRow(`
			SELECT id, name, email, password, role, created_at
			FROM users
			WHERE email = $1
		`, request.Email).Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&hashedPassword,
			&user.Role,
			&user.CreatedAt,
		)

		if err == sql.ErrNoRows {
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		if err != nil {
			http.Error(w, "Failed to find user", http.StatusInternalServerError)
			return
		}

		// Compare password with stored hash
		err = bcrypt.CompareHashAndPassword(
			[]byte(hashedPassword),
			[]byte(request.Password),
		)

		if err != nil {
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		// Login successful
		// Create JWT claims
		claims := Claims{
			UserID: user.ID,
			Email:  user.Email,
			Role:   user.Role,
			RegisteredClaims: jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
				IssuedAt:  jwt.NewNumericDate(time.Now()),
			},
		}

		// Create token
		token := jwt.NewWithClaims(
			jwt.SigningMethodHS256,
			claims,
		)

		// Sign token
		tokenString, err := token.SignedString(jwtSecret)

		if err != nil {
			http.Error(
				w,
				"Failed to create token",
				http.StatusInternalServerError,
			)
			return
		}

		// Send response
		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(map[string]interface{}{
			"message": "Login successful",
			"token":   tokenString,
			"user":    user,
		})

		w.Header().Set("Content-Type", "application/json")

		// json.NewEncoder(w).Encode(response)
	}
}

func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")

		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, "Invalid authorization format", http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]

		token, err := jwt.ParseWithClaims(
			tokenString,
			&Claims{},
			func(token *jwt.Token) (interface{}, error) {

				if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, jwt.ErrTokenSignatureInvalid
				}

				return jwtSecret, nil
			},
		)

		if err != nil {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		if !token.Valid {
			http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(*Claims)

		if !ok {
			http.Error(w, "Invalid token claims", http.StatusUnauthorized)
			return
		}

		// Put the user ID into the request context
		ctx := context.WithValue(r.Context(), userIDKey, claims.UserID)

		ctx = context.WithValue(ctx, roleKey, claims.Role)

		r = r.WithContext(ctx)

		// Print user information
		fmt.Println("User ID:", claims.UserID)
		fmt.Println("Email:", claims.Email)
		fmt.Println("Role:", claims.Role)

		// Continue to the actual handler
		next(w, r)
	}
}

func adminMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		roleValue := r.Context().Value(roleKey)

		role, ok := roleValue.(string)

		if !ok {
			http.Error(w, "Role not found", http.StatusUnauthorized)
			return
		}

		if role != "admin" {
			http.Error(w, "Admin access required", http.StatusForbidden)
			return
		}

		next(w, r)
	}
}

func adminUsersHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		rows, err := db.Query(`
			SELECT id, name, email, role, created_at
			FROM users
			ORDER BY id
		`)

		if err != nil {
			http.Error(w, "Failed to fetch users", http.StatusInternalServerError)
			return
		}

		defer rows.Close()

		var users []User

		for rows.Next() {
			var user User

			err := rows.Scan(
				&user.ID,
				&user.Name,
				&user.Email,
				&user.Role,
				&user.CreatedAt,
			)

			if err != nil {
				http.Error(w, "Failed to read user", http.StatusInternalServerError)
				return
			}

			users = append(users, user)
		}

		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(users)
	}
}

func profileHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(map[string]string{
		"message": "You accessed a protected endpoint",
	})
}

func meHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		userIDValue := r.Context().Value(userIDKey)

		userID, ok := userIDValue.(int)

		if !ok {
			http.Error(w, "User ID not found in token", http.StatusUnauthorized)
			return
		}

		var user User

		err := db.QueryRow(`
			SELECT id, name, email, role, created_at
			FROM users
			WHERE id = $1
		`, userID).Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&user.Role,
			&user.CreatedAt,
		)

		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "User not found", http.StatusNotFound)
				return
			}

			http.Error(w, "Failed to fetch user", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(user)
	}
}

func watchMovieHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		// Get logged-in user's ID from JWT context
		userIDValue := r.Context().Value(userIDKey)

		userID, ok := userIDValue.(int)

		if !ok {
			http.Error(w, "User ID not found in token", http.StatusUnauthorized)
			return
		}

		// Get movie ID from URL
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")

		if len(parts) != 3 || parts[0] != "movies" || parts[2] != "watch" {
			http.Error(w, "Invalid URL", http.StatusBadRequest)
			return
		}

		movieID, err := strconv.Atoi(parts[1])

		if err != nil {
			http.Error(w, "Invalid movie ID", http.StatusBadRequest)
			return
		}

		// Check that movie exists
		var exists bool

		err = db.QueryRow(
			"SELECT EXISTS(SELECT 1 FROM movies WHERE id = $1)",
			movieID,
		).Scan(&exists)

		if err != nil {
			http.Error(w, "Failed to check movie", http.StatusInternalServerError)
			return
		}

		if !exists {
			http.Error(w, "Movie not found", http.StatusNotFound)
			return
		}

		// Record watch history
		_, err = db.Exec(`
			INSERT INTO watch_history (user_id, movie_id)
			VALUES ($1, $2)
		`, userID, movieID)

		if err != nil {
			http.Error(w, "Failed to record watch history", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(map[string]interface{}{
			"message":  "Movie marked as watched",
			"user_id":  userID,
			"movie_id": movieID,
		})
	}
}

func watchHistoryHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		// Get logged-in user's ID from JWT context
		userIDValue := r.Context().Value(userIDKey)

		userID, ok := userIDValue.(int)

		if !ok {
			http.Error(w, "User ID not found in token", http.StatusUnauthorized)
			return
		}

		rows, err := db.Query(`
			SELECT
				m.id,
				m.title,
				m.genre,
				m.language,
				m.duration,
				wh.watched_at
			FROM watch_history wh
			JOIN movies m ON wh.movie_id = m.id
			WHERE wh.user_id = $1
			ORDER BY wh.watched_at DESC
		`, userID)

		if err != nil {
			http.Error(
				w,
				"Failed to fetch watch history",
				http.StatusInternalServerError,
			)
			return
		}

		defer rows.Close()

		type WatchHistoryItem struct {
			MovieID   int    `json:"movie_id"`
			Title     string `json:"title"`
			Genre     string `json:"genre"`
			Language  string `json:"language"`
			Duration  int    `json:"duration"`
			WatchedAt string `json:"watched_at"`
		}

		var history []WatchHistoryItem

		for rows.Next() {

			var item WatchHistoryItem

			err := rows.Scan(
				&item.MovieID,
				&item.Title,
				&item.Genre,
				&item.Language,
				&item.Duration,
				&item.WatchedAt,
			)

			if err != nil {
				http.Error(
					w,
					"Failed to read watch history",
					http.StatusInternalServerError,
				)
				return
			}

			history = append(history, item)
		}

		if err = rows.Err(); err != nil {
			http.Error(
				w,
				"Failed to read watch history",
				http.StatusInternalServerError,
			)
			return
		}

		w.Header().Set("Content-Type", "application/json")

		if history == nil {
			history = []WatchHistoryItem{}
		}

		json.NewEncoder(w).Encode(history)
	}
}

// =========================
// MAIN
// =========================
func main() {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	jwtSecret = []byte(os.Getenv("JWT_SECRET"))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(map[string]string{
			"message": "Movie Management REST API is running",
			"status":  "OK",
		})
	})

	// =========================
	// Connect to PostgreSQL
	// =========================

	db, err := database.Connect()

	if err != nil {
		log.Fatal("Database connection failed:", err)
	}

	defer db.Close()

	fmt.Println("Database connected successfully!")

	// =========================
	// Connect to Redis
	// =========================

	err = cache.ConnectRedis()

	if err != nil {
		log.Fatal("Redis connection failed:", err)
	}

	fmt.Println("Redis connected successfully!")

	// =========================
	// Authentication
	// =========================

	http.HandleFunc("/auth/register", registerHandler(db))

	http.HandleFunc("/auth/login", loginHandler(db))

	http.HandleFunc(
		"/users/profile",
		authMiddleware(profileHandler),
	)

	http.HandleFunc(
		"/admin/users",
		authMiddleware(
			adminMiddleware(
				adminUsersHandler(db),
			),
		),
	)

	http.HandleFunc(
		"/users/me",
		authMiddleware(meHandler(db)),
	)

	http.HandleFunc(
		"/users/me/watch-history",
		authMiddleware(watchHistoryHandler(db)),
	)

	// =========================
	// Movies
	// =========================

	http.HandleFunc("/movies", func(w http.ResponseWriter, r *http.Request) {

		// -------------------------
		// GET /movies
		// Public
		// -------------------------

		if r.Method == http.MethodGet {
			moviesHandler(db)(w, r)
			return
		}

		// -------------------------
		// POST /movies
		// Admin only
		// -------------------------

		if r.Method == http.MethodPost {

			authMiddleware(
				adminMiddleware(
					createMovieHandler(db),
				),
			)(w, r)

			return
		}

		http.Error(
			w,
			"Method not allowed",
			http.StatusMethodNotAllowed,
		)
	})

	// =========================
	// Search
	// =========================

	http.HandleFunc(
		"/movies/search",
		searchMoviesHandler(db),
	)

	// =========================
	// Movie ID / Show Timings / Watch
	// =========================

	http.HandleFunc("/movies/", func(w http.ResponseWriter, r *http.Request) {

		parts := strings.Split(
			strings.Trim(r.URL.Path, "/"),
			"/",
		)

		// =========================
		// /movies/5/show-times
		// =========================

		if len(parts) == 3 &&
			parts[0] == "movies" &&
			parts[2] == "show-times" {

			// -------------------------
			// GET show timings
			// Public
			// -------------------------

			if r.Method == http.MethodGet {
				showTimingsHandler(db)(w, r)
				return
			}

			// -------------------------
			// POST show timing
			// Admin only
			// -------------------------

			if r.Method == http.MethodPost {

				authMiddleware(
					adminMiddleware(
						createShowTimingHandler(db),
					),
				)(w, r)

				return
			}

			http.Error(
				w,
				"Method not allowed",
				http.StatusMethodNotAllowed,
			)

			return
		}

		// =========================
		// /movies/5/watch
		// =========================

		if len(parts) == 3 &&
			parts[0] == "movies" &&
			parts[2] == "watch" {

			if r.Method == http.MethodPost {

				authMiddleware(
					watchMovieHandler(db),
				)(w, r)

				return
			}

			http.Error(
				w,
				"Method not allowed",
				http.StatusMethodNotAllowed,
			)

			return
		}

		// =========================
		// /movies/5
		// =========================

		if len(parts) == 2 &&
			parts[0] == "movies" {

			// -------------------------
			// GET /movies/:id
			// Public
			// -------------------------

			if r.Method == http.MethodGet {
				getMovieHandler(db)(w, r)
				return
			}

			// -------------------------
			// DELETE /movies/:id
			// Admin only
			// -------------------------

			if r.Method == http.MethodDelete {

				authMiddleware(
					adminMiddleware(
						deleteMovieHandler(db),
					),
				)(w, r)

				return
			}

			http.Error(
				w,
				"Method not allowed",
				http.StatusMethodNotAllowed,
			)

			return
		}

		// =========================
		// Invalid URL
		// =========================

		http.Error(
			w,
			"Invalid URL",
			http.StatusBadRequest,
		)
	})

	// =========================
	// Start Server
	// =========================

	fmt.Println("Server running on http://localhost:8080")

	err = http.ListenAndServe(":8080", nil)

	if err != nil {
		log.Fatal("Server failed:", err)
	}
}
