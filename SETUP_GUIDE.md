# Setup Instructions

## Quick Start

### 1. Install Backend Dependencies

```bash
cd back
npm install
```

This will install:

- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- cors (CORS support)
- @types/bcrypt, @types/jsonwebtoken, @types/cors (TypeScript types)

### 2. Run Database Migrations

```bash
cd back
npm run migrate up
```

This will create:

- users table with role-based access
- property_managers junction table
- Updated properties table with owner_id

### 3. Set Environment Variables

Create a `.env` file in the `back/` folder:

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/your_database
```

### 4. Start the Backend

```bash
cd back
npm run dev
```

### 5. Start the Frontend

```bash
cd FRONTEND
npm install  # or pnpm install
npm run dev  # or pnpm dev
```

## Testing the Auth System

### 1. Register a Property Owner

- Go to http://localhost:3000/register
- Select "Property Owner" as account type
- Fill in your details
- Submit

### 2. Create a Property

- After registration, you'll be redirected to the properties page
- Click "Add New Property"
- Fill in property details
- Submit

### 3. Access Property Dashboard

- Click on any property card
- You'll be redirected to the property dashboard
- The selected property ID is stored and used for all property operations

### 4. Register a Manager (Optional)

- Logout and register a new account with "Manager" role
- Property owners can assign managers through the API:
  ```bash
  POST /api/users/properties/{propertyId}/managers
  {
    "propertyId": "...",
    "managerId": "..."
  }
  ```

## API Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

The token is automatically added by the frontend when using the API helpers.

## Role-Based Access

| Role             | Can Do                                                              |
| ---------------- | ------------------------------------------------------------------- |
| property_owner   | Create properties, assign managers, full access to owned properties |
| manager          | Access assigned properties, manage rooms/bookings                   |
| website_customer | Book rooms (to be implemented)                                      |
| offline_customer | Walk-in bookings (to be implemented)                                |

## Troubleshooting

### Migration Issues

If migrations fail, check:

- Database connection in config/db.js
- Migrations ran in order (001, 002, 003, 004)

### Auth Issues

- Verify JWT_SECRET is set in .env
- Check token is being sent in Authorization header
- Ensure user has correct role for the endpoint

### CORS Issues

- Backend has CORS enabled for all origins in development
- Configure specific origins in production
