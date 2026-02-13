#!/bin/bash

# Architectural Autonomous Platform Deployment Script

set -e

echo "Architectural Autonomous Platform Deployment"
echo "============================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Please run setup.sh first."
    exit 1
fi

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Build and start the services
echo "Building and starting services..."
docker-compose up -d --build

# Run database migrations
echo "Running database migrations..."
docker-compose exec backend alembic upgrade head

# Restart services
echo "Restarting services..."
docker-compose restart

echo "Deployment complete!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
