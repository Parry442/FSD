#!/bin/bash

echo "🚀 Setting up Application Testing Suite..."
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL first."
    echo "   You can download it from: https://www.postgresql.org/download/"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ PostgreSQL is installed"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
    echo "   Important: Set your database credentials and JWT secret!"
else
    echo "✅ .env file already exists"
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Server dependencies installed"
else
    echo "❌ Failed to install server dependencies"
    exit 1
fi

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

if [ $? -eq 0 ]; then
    echo "✅ Client dependencies installed"
    cd ..
else
    echo "❌ Failed to install client dependencies"
    cd ..
    exit 1
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p server/uploads/scenarios
mkdir -p server/uploads/defects
echo "✅ Uploads directory created"

# Database setup instructions
echo ""
echo "🗄️  Database Setup Instructions:"
echo "================================="
echo "1. Create a PostgreSQL database named 'testing_suite'"
echo "2. Update the .env file with your database credentials"
echo "3. Run the database migration: npm run migrate"
echo "4. (Optional) Seed the database with sample data: npm run seed"
echo ""

# Final instructions
echo "🎯 Next Steps:"
echo "==============="
echo "1. Update .env file with your configuration"
echo "2. Set up your PostgreSQL database"
echo "3. Run: npm run migrate"
echo "4. Run: npm run seed (optional)"
echo "5. Start the application: npm run dev"
echo ""
echo "🌐 The application will be available at:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend: http://localhost:5000"
echo "   - WebSocket: http://localhost:5001"
echo ""
echo "✨ Setup completed successfully!"
echo "   Happy testing! 🧪"