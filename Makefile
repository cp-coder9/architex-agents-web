# Architectural Autonomous Platform Makefile

.PHONY: dev deploy build clean test lint format help

help:
@echo "Architectural Autonomous Platform Development Commands"
@echo "======================================================"
@echo ""
@echo "Development:"
@echo "  make dev          - Start development environment"
@echo "  make build        - Build Docker images"
@echo "  make deploy       - Deploy to production"
@echo "  make clean        - Clean up Docker resources"
@echo ""
@echo "Testing:"
@echo "  make test         - Run all tests"
@echo "  make test-backend - Run backend tests"
@echo "  make test-frontend - Run frontend tests"
@echo ""
@echo "Code Quality:"
@echo "  make lint         - Run linters"
@echo "  make format       - Format code"
@echo ""
@echo "Documentation:"
@echo "  make docs         - Generate documentation"

# Development

dev: .env
@echo "Starting development environment..."
docker-compose -f docker/docker-compose.yml up --build

dev-backend:
@echo "Starting backend development server..."
cd backend && uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
@echo "Starting frontend development server..."
cd frontend && npm run dev

# Build

build:
@echo "Building Docker images..."
docker-compose -f docker/docker-compose.yml build

# Deploy

deploy: build
@echo "Deploying to production..."
docker-compose -f docker/docker-compose.yml up -d

# Clean

clean:
@echo "Cleaning up Docker resources..."
docker-compose -f docker/docker-compose.yml down -v
docker system prune -a --volumes

# Testing

test: test-backend test-frontend
@echo "All tests completed."

test-backend:
@echo "Running backend tests..."
cd backend && pytest

test-frontend:
@echo "Running frontend tests..."
cd frontend && npm test

# Code Quality

lint:
@echo "Running linters..."
cd backend && flake8 api/ core/ db/ agents/ services/
cd backend && mypy api/ core/ db/ agents/ services/
cd frontend && npm run lint

format:
@echo "Formatting code..."
cd backend && black api/ core/ db/ agents/ services/
cd backend && isort api/ core/ db/ agents/ services/
cd frontend && npm run format

# Documentation

docs:
@echo "Generating documentation..."
cd backend && pdoc --html --output-dir docs/api api/
@echo "Documentation generated in backend/docs/api/"

# Environment

.env:
@echo "Creating .env file from .env.example..."
cp .env.example .env
@echo "Please edit .env with your configuration."

# Database

db-migrate:
@echo "Running database migrations..."
cd backend && alembic upgrade head

db-migrate-create:
@echo "Creating new database migration..."
cd backend && alembic revision -m "$(message)"

# Utilities

logs:
@echo "Showing application logs..."
docker-compose -f docker/docker-compose.yml logs -f

shell:
@echo "Opening shell in backend container..."
docker-compose -f docker/docker-compose.yml exec backend bash

