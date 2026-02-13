# Architectural Autonomous Platform

A production-ready AI-powered compliance checking platform for architectural projects.

## Overview

The Architectural Autonomous Platform is a comprehensive solution that automates the compliance checking process for architectural projects. It leverages advanced AI agents to analyze project submissions against various regulatory requirements including walls, dimensions, windows/doors, areas, energy efficiency, and council requirements.

## Features

- **AI-Powered Compliance Checking**: Automated analysis using specialized AI agents
- **Multi-Agent Architecture**: Dedicated agents for different compliance areas
- **Project Management**: Complete workflow from submission to approval
- **Real-time Tracking**: Dashboard for monitoring project status
- **Admin Oversight**: Human review and approval capabilities
- **Comprehensive Reporting**: Detailed compliance reports with recommendations

## Architecture

### Backend (FastAPI)

- RESTful API endpoints
- PostgreSQL database with SQLAlchemy ORM
- Multi-agent AI orchestrator
- Specialized compliance agents
- File upload and processing

### Frontend (Next.js)

- React-based user interface
- Project upload and management
- Dashboard with real-time updates
- Compliance report visualization
- Admin panel

### AI Agents

- **Wall Agent**: Checks wall specifications and requirements
- **Dimension Agent**: Validates dimensional compliance
- **Window/Door Agent**: Analyzes window and door placements
- **Area Agent**: Verifies area calculations and requirements
- **Energy Agent**: Assesses energy efficiency compliance
- **Council Agent**: Ensures adherence to council regulations

## Project Structure

```
architectural-platform/
├── backend/
│   ├── api/
│   │   ├── routers/
│   │   │   ├── projects.py
│   │   │   ├── compliance.py
│   │   │   └── admin.py
│   │   └── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── utils.py
│   ├── db/
│   │   ├── models.py
│   │   ├── session.py
│   │   └── init.py
│   ├── agents/
│   │   ├── base.py
│   │   ├── wall.py
│   │   ├── dimension.py
│   │   ├── window_door.py
│   │   ├── area.py
│   │   ├── energy.py
│   │   └── council.py
│   ├── services/
│   │   ├── compliance_checker.py
│   │   └── report_generator.py
│   ├── tests/
│   │   ├── test_api.py
│   │   └── test_agents.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   └── route.ts
│   │   ├── projects/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   └── projects/
│   ├── lib/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── public/
│   │   └── favicon.ico
│   ├── styles/
│   │   └── globals.css
│   ├── next.config.js
│   └── package.json
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx/
│       └── nginx.conf
├── docs/
│   ├── api.md
│   ├── architecture.md
│   └── deployment.md
├── scripts/
│   ├── deploy.sh
│   └── setup.sh
├── .env.example
├── docker-compose.yml
├── Makefile
└── README.md
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/architectural-platform.git
cd architectural-platform
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the development environment:
```bash
make dev
```

### Production Deployment

1. Build and start the production containers:
```bash
make deploy
```

2. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## API Documentation

Once the backend server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- AI agents powered by OpenAI GPT-4
- Built with FastAPI and Next.js
- Database powered by PostgreSQL
- Containerized with Docker

## Support

For support, please open an issue in the GitHub repository or contact the development team.
