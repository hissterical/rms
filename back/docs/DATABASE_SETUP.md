# PostgreSQL Database Setup for Hotel Management System

## Prerequisites

### 1. Install PostgreSQL

#### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Add PostgreSQL to PATH (add to your ~/.zshrc or ~/.bashrc)
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows
1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the superuser password you set during installation

### 2. Create Database User

```bash
# Switch to postgres user (Linux/macOS)
sudo -u postgres psql

# Or connect directly (if PostgreSQL is installed via Homebrew)
psql postgres
```

In PostgreSQL prompt:
```sql
-- Create user for the hotel management system
CREATE USER hotel_admin WITH PASSWORD 'your_secure_password_here';

-- Grant necessary privileges
ALTER USER hotel_admin CREATEDB;
ALTER USER hotel_admin WITH SUPERUSER;

-- Exit PostgreSQL
\q
```

### 3. Create Databases

```bash
# Connect as the new user
psql -U hotel_admin -h localhost postgres

# Or use createdb command
createdb -U hotel_admin -h localhost hotel_management
createdb -U hotel_admin -h localhost hotel_management_test
```

In PostgreSQL prompt:
```sql
-- Create production database
CREATE DATABASE hotel_management 
    WITH OWNER = hotel_admin
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- Create test database
CREATE DATABASE hotel_management_test 
    WITH OWNER = hotel_admin
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TEMPLATE = template0;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE hotel_management TO hotel_admin;
GRANT ALL PRIVILEGES ON DATABASE hotel_management_test TO hotel_admin;

-- List databases to confirm
\l

-- Exit
\q
```

## Configuration

### 1. Environment Variables

Update your `.env` file:
```env
# Database Configuration
PG_USER=hotel_admin
PG_HOST=localhost
PG_DATABASE=hotel_management
PG_PASSWORD=your_secure_password_here
PG_PORT=5432
DATABASE_URL=postgresql://hotel_admin:your_secure_password_here@localhost:5432/hotel_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-please-change-this
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

Update your `.env.test` file:
```env
# Test Environment Variables
NODE_ENV=test

# Test Database Configuration  
PG_USER=hotel_admin
PG_HOST=localhost
PG_DATABASE=hotel_management_test
PG_TEST_DATABASE=hotel_management_test
PG_PASSWORD=your_secure_password_here
PG_PORT=5432
DATABASE_URL=postgresql://hotel_admin:your_secure_password_here@localhost:5432/hotel_management_test

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
```

### 2. Database Connection Test

Create a simple connection test:
```bash
# Test database connection
psql -U hotel_admin -h localhost -d hotel_management -c "SELECT version();"
```

## Setup Commands

### 1. Run Database Migrations

```bash
# Install dependencies first
npm install

# Run migrations for development database
npm run migrate-up

# Set NODE_ENV and run migrations for test database
NODE_ENV=test npm run migrate-up
```

### 2. Initialize System

```bash
# Initialize production system with default admin
npm run init-system

# Initialize test system with sample data
NODE_ENV=test npm run init-system
```

### 3. Complete Setup

```bash
# One command to set up everything
npm run setup

# For test environment
NODE_ENV=test npm run setup
```

## Verification

### 1. Check Database Structure

```bash
# Connect to database
psql -U hotel_admin -h localhost -d hotel_management

# List all tables
\dt

# Check users table structure
\d users

# Check roles and permissions
SELECT * FROM roles;
SELECT * FROM permissions LIMIT 10;

# Exit
\q
```

### 2. Test API Connection

```bash
# Start the server
npm run dev

# Test health endpoint
curl http://localhost:5000/health

# Test login with default admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hotel.com","password":"AdminPass123!"}'
```

## Troubleshooting

### Common Issues

#### 1. Permission Denied
```bash
# If you get permission denied errors
sudo -u postgres createuser -s hotel_admin
sudo -u postgres createdb -O hotel_admin hotel_management
```

#### 2. Connection Refused
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Start PostgreSQL if needed
sudo systemctl start postgresql  # Linux
brew services start postgresql@15  # macOS
```

#### 3. Authentication Failed
```bash
# Reset password for user
sudo -u postgres psql -c "ALTER USER hotel_admin PASSWORD 'new_password';"
```

#### 4. Database Already Exists
```bash
# Drop and recreate database
psql -U hotel_admin -h localhost postgres -c "DROP DATABASE IF EXISTS hotel_management;"
psql -U hotel_admin -h localhost postgres -c "CREATE DATABASE hotel_management;"
```

### PostgreSQL Configuration

#### 1. Allow Connections (if needed)
Edit `/etc/postgresql/15/main/postgresql.conf`:
```conf
# Listen on all addresses
listen_addresses = '*'
```

Edit `/etc/postgresql/15/main/pg_hba.conf`:
```conf
# Allow local connections
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

#### 2. Restart PostgreSQL
```bash
sudo systemctl restart postgresql  # Linux
brew services restart postgresql@15  # macOS
```

## Database Maintenance

### Backup Database
```bash
# Create backup
pg_dump -U hotel_admin -h localhost hotel_management > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -U hotel_admin -h localhost hotel_management < backup_file.sql
```

### Reset Database
```bash
# Drop all data and reinitialize
npm run migrate down
npm run migrate-up
npm run init-system
```

## Security Recommendations

1. **Change Default Passwords**: Update all default passwords in production
2. **Restrict Access**: Configure `pg_hba.conf` to limit connections
3. **Use SSL**: Enable SSL connections in production
4. **Regular Backups**: Set up automated database backups
5. **Monitor Connections**: Monitor database connections and queries

## Next Steps

After setting up PostgreSQL:

1. **Start the API Server**:
   ```bash
   npm run dev
   ```

2. **Run Tests**:
   ```bash
   npm test
   ```

3. **Access the System**:
   - API Base URL: http://localhost:5000/api
   - Health Check: http://localhost:5000/health
   - Default Admin: admin@hotel.com / AdminPass123!

4. **Create Your First Property Owner**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "firstName": "John",
       "lastName": "Owner",
       "email": "owner@yourhotel.com",
       "phone": "+1234567890",
       "password": "SecurePassword123!",
       "roleName": "property_owner"
     }'
   ```

Your PostgreSQL database is now ready for the Hotel Management System!