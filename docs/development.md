# Development Guide

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Local Development

1. Clone the repository
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run database migrations:
   ```bash
   python -m alembic upgrade head
   ```

6. Start the development servers:
   ```bash
   # Backend
   uvicorn src.api.main:app --reload
   
   # Frontend (in separate terminal)
   cd frontend
   npm run dev
   ```

## Project Structure

```
architectural-platform/
├── src/
│   ├── api/          # FastAPI endpoints
│   ├── orchestrator/ # AI orchestrator logic
│   ├── agents/       # Individual AI agents
│   ├── db/           # Database models and connections
│   └── utils/        # Utility functions
├── frontend/         # React application
├── docs/             # Documentation
├── tests/            # Test suite
└── data/             # Models, schemas, and configuration
```

## AI Agents

The platform uses a multi-agent architecture:

- **WallAgent**: Checks wall specifications for SANS compliance
- **DimensionAgent**: Validates dimensions and room sizes
- **WindowDoorAgent**: Checks window/door schedules and egress
- **AreaAgent**: Computes and validates room areas
- **EnergyAgent**: Evaluates energy compliance (SANS 10400-XA)
- **CouncilAgent**: Aggregates all agent outputs
- **ComplianceFormatterAgent**: Generates human-readable reports

## Testing

### Backend Tests

```bash
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Code Style

- Python: PEP 8 with black formatting
- TypeScript: ESLint with TypeScript rules
- Frontend: Tailwind CSS utility classes

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
