# Architectural Platform Frontend

React frontend application for the Architectural Autonomous Platform.

## Features

- Project upload and management
- Compliance check tracking
- Document viewing and downloading
- Real-time project status updates
- Responsive design with Tailwind CSS

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios for API calls

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at http://localhost:3000

## Project Structure

```
frontend/
├── src/
│   ├── pages/          # Next.js pages
│   ├── components/     # Reusable components
│   ├── app/           # App router pages (if using)
│   ├── lib/           # Utility functions
│   └── styles/        # CSS files
├── public/            # Static assets
└── package.json
```

## API Integration

The frontend connects to the backend API at http://localhost:8000.

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Development

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## License

Proprietary - Apex Planners Pty Ltd
