# SkillLane - Book Management System

A comprehensive book management system built with NestJS, featuring user authentication, book management, and borrowing/returning functionality.

## Prerequisites

Before running this application, make sure you have the following installed:

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

## Quick Start


### 1. Environment Setup

Create a `.env` file in the `server` directory:

```bash
# Database Configuration
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=skilllane_db

# Application Configuration
PORT=8080
JWT_SECRET=secretNaja
```

```bash
# Unit tests
npm run test
```

### Authentication

- `POST /api/v1/auth/login` - User login

### Users

- `POST /api/v1/users` - Create new user
- `GET /api/v1/users/profile` - Get user profile (requires authentication)

### Books

- `GET /api/v1/books` - Get all books (with pagination and filtering)
- `GET /api/v1/books/:id` - Get book by ID
- `POST /api/v1/books` - Create new book (requires authentication)
- `PUT /api/v1/books/:id` - Update book (requires authentication)
- `DELETE /api/v1/books/:id` - Delete book (requires authentication)
- `POST /api/v1/books/:id/borrow` - Borrow book (requires authentication)
- `POST /api/v1/books/:id/return` - Return book (requires authentication)

## Docker

The application includes Docker and Docker Compose configuration for easy setup:

### Using Docker Compose (Recommended)

```bash
# Start both database and application
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d
```

### Docker Services

- **PostgreSQL Database**: `skilllane_postgres` on port 5432
- **NestJS Application**: `skilllane_app` on port 8080
- **File Uploads**: Persistent volume for uploaded files