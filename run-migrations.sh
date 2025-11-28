#!/bin/bash

echo "===================================="
echo "Running Database Migrations"
echo "===================================="
echo ""

cd back

echo "Step 1: Installing dependencies..."
npm install

echo ""
echo "Step 2: Running migrations..."
npm run migrate up

echo ""
echo "===================================="
echo "Migrations Complete!"
echo "===================================="
echo ""
echo "Next steps:"
echo "1. Create a .env file in the back/ folder with:"
echo "   PORT=5000"
echo "   JWT_SECRET=your-secret-key-here"
echo "   DATABASE_URL=your-database-url"
echo ""
echo "2. Start the backend: npm run dev"
echo "3. Start the frontend: cd ../FRONTEND && npm run dev"
echo ""
