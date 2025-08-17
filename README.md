# Application Testing Suite

A comprehensive testing management platform with AI-driven automation, role-based access control, and real-time dashboards.

## Features

- **Test Scenario Repository**: Centralized management of test scenarios with Excel import/export
- **Auto Test Plan Generator**: AI-powered test plan creation for different testing types
- **AI-Driven Script Generation**: Automated test script creation from recorded steps
- **Role-Based Access Control**: Test Manager, Tester, Troubleshooter, and Viewer roles
- **Defect Repository**: Comprehensive defect tracking and workflow management
- **Automated Workflows**: Role-based notifications and task assignments
- **Real-Time Dashboards**: Live status monitoring and reporting

## Tech Stack

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL
- Authentication: JWT with role-based permissions
- AI Integration: OpenAI API for intelligent features
- Real-time: WebSocket connections

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables
3. Run database migrations: `npm run migrate`
4. Start development server: `npm run dev`

## Architecture

The application follows a modular architecture with clear separation of concerns:
- API layer for backend services
- React components for frontend
- Database models for data persistence
- Middleware for authentication and authorization
- AI services for intelligent automation