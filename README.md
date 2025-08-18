# Application Testing Suite

A comprehensive, AI-powered testing management platform that provides test scenario management, test plan generation, test cycle execution, defect tracking, and real-time reporting.

## Features

### 🎯 Core Features
- **Master Test Scenario Repository**: Comprehensive test scenario management with Excel import/export
- **AI-Powered Test Plan Generator**: Automated test plan creation with intelligent scenario selection
- **Test Cycle Management**: Complete test execution workflow with role-based assignments
- **Defect Repository**: Complete lifecycle management with automated workflows
- **Real-time Dashboards**: Live monitoring and reporting capabilities
- **Role-based Access Control**: Secure user management with granular permissions

### 🚀 Advanced Capabilities
- **Excel Integration**: Bulk import/export of test scenarios
- **AI Enhancement**: Intelligent test plan generation and optimization
- **Workflow Automation**: Automated notifications and task assignments
- **Version Control**: Complete audit trail for all changes
- **Real-time Collaboration**: WebSocket-based live updates

## Tech Stack

### Backend
- **Node.js** with Express.js
- **In-Memory Data Storage** (hardcoded JSON for prototype)
- **Socket.io** for real-time communication
- **JWT** authentication
- **Multer** for file uploads

### Frontend
- **React 18** with TypeScript
- **Material-UI** for modern UI components
- **React Router** for navigation
- **React Query** for data fetching
- **Zustand** for state management
- **Socket.io Client** for real-time updates

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd application-testing-suite
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install && cd ..
   ```

3. **Start the application**
   ```bash
   # Start both server and client
   npm run dev
   
   # Or start separately:
   npm run server    # Backend on port 5000
   npm run client    # Frontend on port 3000
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Default login: `admin` / `password123`

## Default Users

The system comes with pre-configured users for testing:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin` | `password123` | Test Manager | Full access to all features |
| `tester1` | `password123` | Tester | Can execute tests and report defects |
| `troubleshooter1` | `password123` | Troubleshooter | Can investigate and resolve defects |
| `viewer1` | `password123` | Viewer | Read-only access to all data |

## Project Structure

```
application-testing-suite/
├── server/                 # Backend server
│   ├── data/              # Hardcoded data and data access layer
│   └── index.js           # Main server file with all routes
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── App.tsx        # Main application
│   └── public/            # Static assets
├── start.sh               # Quick start script
├── README.md              # Setup instructions
├── DEMO_GUIDE.md          # Demonstration guide
├── PROJECT_OVERVIEW.md     # Technical details
└── SUMMARY.md             # Complete overview
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Test Scenarios
- `GET /api/test-scenarios` - List scenarios
- `POST /api/test-scenarios` - Create scenario
- `PUT /api/test-scenarios/:id` - Update scenario
- `DELETE /api/test-scenarios/:id` - Delete scenario

### Test Plans
- `GET /api/test-plans` - List plans
- `POST /api/test-plans` - Create plan
- `PUT /api/test-plans/:id` - Update plan
- `DELETE /api/test-plans/:id` - Delete plan

### Test Cycles
- `GET /api/test-cycles` - List cycles
- `POST /api/test-cycles` - Create cycle
- `PUT /api/test-cycles/:id` - Update cycle
- `DELETE /api/test-cycles/:id` - Delete cycle

### Defects
- `GET /api/defects` - List defects
- `POST /api/defects` - Create defect
- `PUT /api/defects/:id` - Update defect
- `DELETE /api/defects/:id` - Delete defect

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Dashboard
- `GET /api/dashboard` - Get dashboard data

## Development

### Adding New Features
1. Add data models to `server/data/index.js`
2. Add API routes in `server/index.js`
3. Create React components in `client/src/components/`
4. Update navigation in `client/src/App.tsx`

### Data Management
- All data is stored in memory using hardcoded JSON
- Data persists during server runtime
- Data resets when server restarts
- Easy to modify sample data in `server/data/index.js`

### Environment Configuration
- Server runs on port 5000 by default
- Client runs on port 3000 by default
- JWT secret is hardcoded (change for production)

## Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Configure production database (replace hardcoded data)
3. Set secure JWT secret
4. Configure CORS for production domain
5. Build client: `npm run build`
6. Use PM2 or similar for process management

### Docker Deployment
```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**Note**: This is a prototype-level application designed for demonstration and development purposes. The application uses hardcoded data instead of a database for simplicity. For production use, implement proper database integration and additional security measures.