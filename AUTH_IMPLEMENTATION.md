# Authentication System Implementation

## Overview

This project now implements a complete role-based authentication system with the following roles:

- **Property Owner**: Can create and manage properties
- **Manager**: Can manage properties they are assigned to
- **Website Customer**: Can book rooms online
- **Offline Customer**: Walk-in customers

## Database Changes

### New Migration: `004_add_property_managers.sql`

Creates a junction table for assigning managers to properties.

Run migrations:

```bash
cd back
npm run migrate up
```

## Backend Changes

### New Dependencies

- `bcrypt`: Password hashing
- `jsonwebtoken`: JWT token generation and verification
- `cors`: Enable CORS for frontend communication

Install dependencies:

```bash
cd back
npm install
```

### New Files

- `middleware/auth.js`: Authentication middleware and role-based access control
- `services/userService.js`: User management and property-manager operations
- `controllers/userController.js`: User controllers for auth endpoints
- `routes/userRoutes.js`: User and auth routes

### Updated Files

- `index.ts`: Added user routes and CORS
- `routes/propertyRoutes.js`: Added authentication to all property endpoints
- `package.json`: Added new dependencies

## Frontend Changes

### New Files

- `contexts/auth-context.tsx`: Authentication context provider
- `lib/property-api.ts`: API helpers for property operations
- `app/register/page.tsx`: New signup page with role selection
- `app/dashboard/properties/page.tsx`: Property owner dashboard
- `app/dashboard/properties/new/page.tsx`: Create new property page

### Updated Files

- `app/layout.tsx`: Added AuthProvider
- `app/login/page.tsx`: Integrated with auth context
- `app/dashboard/layout.tsx`: Added authentication check and property selection
- `lib/api.ts`: Added auth headers helper

## API Endpoints

### Auth Endpoints

```
POST /api/users/register - Register new user
POST /api/users/login - Login user
GET /api/users/profile - Get user profile (authenticated)
PUT /api/users/profile - Update user profile (authenticated)
```

### Property Management

```
GET /api/users/my-properties - Get all properties for authenticated user
POST /api/properties - Create property (property owners only)
GET /api/properties/:propertyId - Get property (requires access)
PATCH /api/properties/:propertyId - Update property (requires access)
DELETE /api/properties/:propertyId - Delete property (requires access)
```

### Manager Assignment

```
POST /api/users/properties/:propertyId/managers - Assign manager (owners only)
DELETE /api/users/properties/:propertyId/managers - Unassign manager (owners only)
GET /api/users/properties/:propertyId/managers - Get property managers
```

## User Flow

### Property Owner Flow

1. Register with role `property_owner`
2. Redirected to `/dashboard/properties`
3. Create new properties
4. Click on a property to manage it
5. Access full dashboard for that property

### Manager Flow

1. Register with role `manager`
2. Property owner assigns manager to property
3. Manager sees assigned properties in `/dashboard/properties`
4. Click on a property to manage it
5. Access dashboard for assigned properties only

### Customer Flow

1. Register with role `website_customer` or `offline_customer`
2. Access booking features (to be implemented)

## Environment Variables

Add to `.env` file in `back/` folder:

```
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
DATABASE_URL=your-database-url
```

## Running the Application

### Backend

```bash
cd back
npm install
npm run migrate up
npm run dev
```

### Frontend

```bash
cd FRONTEND
npm install  # or pnpm install
npm run dev  # or pnpm dev
```

## Security Notes

1. **JWT Secret**: Change the JWT_SECRET in production
2. **Password Hashing**: Using bcrypt with 10 salt rounds
3. **CORS**: Configure allowed origins in production
4. **Token Storage**: Tokens stored in localStorage (consider httpOnly cookies for production)
5. **Role-based Access**: All property endpoints check user permissions

## Next Steps

1. Run the migration to create the property_managers table
2. Install backend dependencies
3. Set up environment variables
4. Test registration and login flows
5. Test property creation and management
6. Implement manager assignment UI (optional enhancement)
