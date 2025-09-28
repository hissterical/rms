#!/bin/bash

# PostgreSQL Database Setup Script for Hotel Management System
# This script automates the PostgreSQL database setup process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="hotel_management"
DB_TEST_NAME="hotel_management_test"
DB_USER="hotel_admin"
DB_HOST="localhost"
DB_PORT="5432"

echo -e "${GREEN}🏨 Hotel Management System - PostgreSQL Setup${NC}"
echo "=============================================="

# Function to print status messages
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if PostgreSQL is installed
check_postgresql() {
    echo "Checking PostgreSQL installation..."
    
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed or not in PATH"
        echo ""
        echo "Please install PostgreSQL first:"
        echo "  macOS: brew install postgresql@15"
        echo "  Ubuntu: sudo apt install postgresql postgresql-contrib"
        echo "  Windows: Download from https://www.postgresql.org/download/"
        exit 1
    fi
    
    print_status "PostgreSQL is installed"
    
    # Check if PostgreSQL service is running
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" &> /dev/null; then
        print_warning "PostgreSQL service is not running"
        echo "Starting PostgreSQL service..."
        
        # Try to start PostgreSQL (different methods for different systems)
        if command -v brew &> /dev/null; then
            brew services start postgresql@15 || true
        elif command -v systemctl &> /dev/null; then
            sudo systemctl start postgresql || true
        fi
        
        # Wait a moment for service to start
        sleep 3
        
        if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" &> /dev/null; then
            print_error "Failed to start PostgreSQL service"
            echo "Please start PostgreSQL manually and run this script again"
            exit 1
        fi
    fi
    
    print_status "PostgreSQL service is running"
}

# Get database password from user
get_password() {
    if [ -z "$DB_PASSWORD" ]; then
        echo ""
        read -s -p "Enter password for database user '$DB_USER' (will be created if doesn't exist): " DB_PASSWORD
        echo ""
        
        if [ -z "$DB_PASSWORD" ]; then
            print_error "Password cannot be empty"
            exit 1
        fi
    fi
}

# Create database user
create_user() {
    echo ""
    echo "Creating database user..."
    
    # Check if user already exists
    if psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" 2>/dev/null | grep -q 1; then
        print_status "User '$DB_USER' already exists"
        
        # Update password
        PGPASSWORD="postgres" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || {
            # Try with current user if postgres user doesn't work
            psql -h "$DB_HOST" -p "$DB_PORT" -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || {
                print_warning "Could not update user password (user might already exist with different credentials)"
            }
        }
    else
        # Create new user
        PGPASSWORD="postgres" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "
            CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
            ALTER USER $DB_USER CREATEDB;
            ALTER USER $DB_USER WITH SUPERUSER;
        " 2>/dev/null || {
            # Try with current user if postgres user doesn't work
            psql -h "$DB_HOST" -p "$DB_PORT" -c "
                CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
                ALTER USER $DB_USER CREATEDB;
                ALTER USER $DB_USER WITH SUPERUSER;
            " 2>/dev/null || {
                print_error "Failed to create database user"
                echo "Please create the user manually:"
                echo "  psql -U postgres -c \"CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';\""
                exit 1
            }
        }
        print_status "Created database user '$DB_USER'"
    fi
}

# Create databases
create_databases() {
    echo ""
    echo "Creating databases..."
    
    # Set password for connection
    export PGPASSWORD="$DB_PASSWORD"
    
    # Create main database
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        print_status "Database '$DB_NAME' already exists"
    else
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME WITH OWNER = $DB_USER ENCODING = 'UTF8';" 2>/dev/null || {
            createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" || {
                print_error "Failed to create database '$DB_NAME'"
                exit 1
            }
        }
        print_status "Created database '$DB_NAME'"
    fi
    
    # Create test database
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_TEST_NAME"; then
        print_status "Test database '$DB_TEST_NAME' already exists"
    else
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_TEST_NAME WITH OWNER = $DB_USER ENCODING = 'UTF8';" 2>/dev/null || {
            createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_TEST_NAME" || {
                print_error "Failed to create test database '$DB_TEST_NAME'"
                exit 1
            }
        }
        print_status "Created test database '$DB_TEST_NAME'"
    fi
}

# Test connection
test_connection() {
    echo ""
    echo "Testing database connection..."
    
    export PGPASSWORD="$DB_PASSWORD"
    
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" &>/dev/null; then
        print_status "Database connection successful"
    else
        print_error "Failed to connect to database"
        exit 1
    fi
}

# Create .env file
create_env_file() {
    echo ""
    echo "Creating environment configuration..."
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)
    
    # Create .env file
    cat > .env << EOF
# Database Configuration
PG_USER=$DB_USER
PG_HOST=$DB_HOST
PG_DATABASE=$DB_NAME
PG_PASSWORD=$DB_PASSWORD
PG_PORT=$DB_PORT
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
EOF

    # Create .env.test file
    cat > .env.test << EOF
# Test Environment Variables
NODE_ENV=test

# Test Database Configuration  
PG_USER=$DB_USER
PG_HOST=$DB_HOST
PG_DATABASE=$DB_TEST_NAME
PG_TEST_DATABASE=$DB_TEST_NAME
PG_PASSWORD=$DB_PASSWORD
PG_PORT=$DB_PORT
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_TEST_NAME

# JWT Configuration for Tests
JWT_SECRET=test-jwt-secret-key-for-testing-only-minimum-32-characters-long
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=24h

# Server Configuration
PORT=5001
FRONTEND_URL=http://localhost:3000

# Admin Configuration for Tests
ADMIN_EMAIL=testadmin@test.com
ADMIN_PASSWORD=TestAdmin123!
EOF

    print_status "Created .env and .env.test files"
}

# Main execution
main() {
    echo ""
    echo "This script will:"
    echo "1. Check PostgreSQL installation"
    echo "2. Create database user '$DB_USER'"
    echo "3. Create databases '$DB_NAME' and '$DB_TEST_NAME'"
    echo "4. Test database connection"
    echo "5. Create environment configuration files"
    echo ""
    
    # Check if running in CI or automated environment
    if [ -t 0 ]; then
        read -p "Do you want to continue? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Setup cancelled"
            exit 0
        fi
    fi
    
    # Run setup steps
    check_postgresql
    get_password
    create_user
    create_databases
    test_connection
    create_env_file
    
    echo ""
    echo -e "${GREEN}🎉 PostgreSQL setup completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Install Node.js dependencies: npm install"
    echo "2. Run database migrations: npm run migrate-up"
    echo "3. Initialize system data: npm run init-system"
    echo "4. Start the development server: npm run dev"
    echo ""
    echo "Database connection details:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo ""
    echo "Test your connection:"
    echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
}

# Run main function
main "$@"