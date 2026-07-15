#!/bin/bash

echo "🚀 SalesPro - Complete Setup Script"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL CLI not found. Make sure PostgreSQL is running.${NC}"
else
    echo -e "${GREEN}✅ PostgreSQL found${NC}"
fi

echo ""
echo "📦 Installing root dependencies..."
npm install
echo -e "${GREEN}✅ Root dependencies installed${NC}"

echo ""
echo "📦 Installing server dependencies..."
cd server && npm install
cd ..
echo -e "${GREEN}✅ Server dependencies installed${NC}"

echo ""
echo "📦 Installing client dependencies..."
cd client && npm install
cd ..
echo -e "${GREEN}✅ Client dependencies installed${NC}"

echo ""
echo "🗄️  Setting up database..."

# Ask for database credentials
read -p "Enter PostgreSQL host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter PostgreSQL port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Enter PostgreSQL password: " DB_PASSWORD
echo ""

read -p "Enter database name (default: inventory_sales): " DB_NAME
DB_NAME=${DB_NAME:-inventory_sales}

# Create .env files
echo "Creating server/.env..."
cat > server/.env << EOF
NODE_ENV=development
PORT=5000
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=dev_jwt_secret_change_in_production_$(date +%s)
JWT_REFRESH_SECRET=dev_refresh_secret_change_in_production_$(date +%s)
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:3000
PAYSTACK_SECRET_KEY=sk_test_placeholder
PAYSTACK_PUBLIC_KEY=pk_test_placeholder
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST_placeholder
FLUTTERWAVE_SECRET_HASH=placeholder_hash
LOG_LEVEL=debug
EOF
echo -e "${GREEN}✅ server/.env created${NC}"

echo "Creating client/.env..."
cat > client/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_PAYSTACK_KEY=pk_test_placeholder
REACT_APP_FLUTTERWAVE_KEY=FLWPUBK_TEST_placeholder
EOF
echo -e "${GREEN}✅ client/.env created${NC}"

# Create database
echo ""
echo "Creating database if not exists..."
if command -v psql &> /dev/null; then
    PGPASSWORD=${DB_PASSWORD} psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -c "CREATE DATABASE ${DB_NAME};" 2>/dev/null
    echo -e "${GREEN}✅ Database ready${NC}"
else
    echo -e "${YELLOW}⚠️  Please create database '${DB_NAME}' manually${NC}"
fi

# Run migrations
echo ""
echo "Running database migrations..."
cd server
npm run migrate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations completed${NC}"
else
    echo -e "${RED}❌ Migration failed. Check your database connection.${NC}"
    exit 1
fi

# Run seeds
echo ""
echo "Seeding sample data..."
npm run seed
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Sample data seeded${NC}"
else
    echo -e "${RED}❌ Seeding failed${NC}"
    exit 1
fi
cd ..

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 SETUP COMPLETE!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To start the application:"
echo "  npm run dev"
echo ""
echo "Login credentials (Password: Password@123):"
echo "  Admin:    admin@salespro.com"
echo "  Sales Rep: john.smith@salespro.com"
echo "  Dispatch: dispatch1@speedexlogistics.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"