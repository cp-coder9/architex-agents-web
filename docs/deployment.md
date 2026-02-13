# Deployment Guide

## Production Deployment

### Prerequisites

- Docker and Docker Compose
- PostgreSQL database
- S3-compatible storage (for file storage)
- Domain name with SSL certificate

### Docker Deployment

1. Build the Docker images:
   ```bash
   docker-compose build
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.production
   # Edit .env.production with production configuration
   ```

3. Run the application:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

1. Install system dependencies:
   ```bash
   apt-get update
   apt-get install -y postgresql postgresql-contrib
   ```

2. Set up PostgreSQL:
   ```bash
   sudo -u postgres createuser -s youruser
   sudo -u postgres createdb architectural_platform
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run database migrations:
   ```bash
   python -m alembic upgrade head
   ```

5. Start the application:
   ```bash
   uvicorn src.api.main:app --host 0.0.0.0 --port 8000
   ```

### Environment Variables

Required production environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `SECRET_KEY`: Secret key for JWT tokens
- `FILE_STORAGE_PATH`: Path for file storage
- `APP_ENV`: Set to "production"

## Monitoring

### Health Check

The application provides a health check endpoint:

```bash
curl http://localhost:8000/health
```

### Logs

Logs are stored in `/a0/tmp/logs/architectural_platform.log`.

## Backup

### Database Backup

```bash
pg_dump -U postgres architectural_platform > backup.sql
```

### File Backup

```bash
rsync -av /a0/tmp/uploads/ backup:/path/to/backups/
```

## Scaling

### Horizontal Scaling

1. Use a load balancer (nginx, HAProxy)
2. Run multiple instances of the application
3. Use a shared database
4. Use shared file storage (S3)

### Vertical Scaling

1. Increase server resources
2. Optimize database queries
3. Add caching (Redis)
4. Use CDN for static assets
