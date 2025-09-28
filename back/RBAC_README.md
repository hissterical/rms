# Hotel Management System - RBAC Documentation

## Overview
This hotel management system implements a comprehensive Role-Based Access Control (RBAC) system using JSON Web Tokens (JWT) for authentication and authorization.

## System Roles

### Super Admin (`super_admin`)
- **Description**: Complete system access and control
- **Permissions**: All permissions across all resources
- **Use Cases**: System maintenance, global configuration, emergency access

### Property Owner (`property_owner`)
- **Description**: Owns properties and can manage staff
- **Key Permissions**:
  - Create, read, update, delete properties
  - Manage staff assignments
  - View all reports (financial, occupancy, performance)
  - Create and manage user accounts for their properties
- **Restrictions**: Limited to properties they own

### Hotel Manager (`hotel_manager`)
- **Description**: Manages property operations and bookings
- **Key Permissions**:
  - Read and update property information
  - Full room and room type management
  - Complete booking management including check-in/check-out
  - View reports and analytics
  - Manage front desk and housekeeping staff
- **Restrictions**: Limited to assigned properties

### Front Desk (`front_desk`)
- **Description**: Handles guest services and basic operations
- **Key Permissions**:
  - Create, read, update bookings
  - Perform check-in and check-out operations
  - Update room status
  - Basic guest management
  - View occupancy reports
- **Restrictions**: Cannot delete bookings or manage staff

### Housekeeping (`housekeeping`)
- **Description**: Manages room status and maintenance
- **Key Permissions**:
  - Read property and room information
  - Update room status (cleaning, maintenance, available)
  - View booking information for room assignments
- **Restrictions**: Very limited access, focused on operational needs

### Guest (`guest`)
- **Description**: Hotel guests with self-service capabilities
- **Key Permissions**:
  - Create bookings (own bookings only)
  - View and update own profile
  - View property information
  - View own booking history
- **Restrictions**: Can only access their own data

## Authentication Flow

### 1. User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securepassword123",
  "roleName": "guest"
}
```

### 2. User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response includes:**
- JWT access token (24h default expiry)
- Refresh token (7d default expiry)
- User profile with permissions

### 3. Token Usage
Include JWT token in Authorization header:
```http
Authorization: Bearer <jwt_token>
```

### 4. Token Refresh
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

## API Route Protection

### Authentication Middleware
- `authenticate`: Validates JWT token and loads user data
- `optionalAuthenticate`: Allows both authenticated and anonymous access

### Authorization Middleware
- `authorize(resource, action)`: Checks specific permissions
- `requireRole(...roles)`: Requires one of specified roles
- `authorizePropertyAccess`: Ensures user can access specific property
- `requireOwnership(param)`: Ensures user owns the resource

### Example Protected Routes
```javascript
// Only property owners and super admins can create properties
router.post("/", 
  authenticate, 
  authorize('properties', 'create'), 
  createProperty
);

// Only users with property access can manage rooms
router.post("/:propertyId/rooms", 
  authenticate,
  authorize('rooms', 'create'),
  authorizePropertyAccess,
  createRoomByPropertyId
);

// Front desk staff and above can perform check-ins
router.post('/bookings/:bookingId/checkin',
  authenticate,
  requireRole('front_desk', 'hotel_manager', 'property_owner', 'super_admin'),
  authorize('bookings', 'check_in'),
  checkIn
);
```

## Database Schema

### Core RBAC Tables
- `roles`: System roles (super_admin, property_owner, etc.)
- `permissions`: Resource-action combinations (properties:create, rooms:update, etc.)
- `role_permissions`: Many-to-many mapping of roles to permissions
- `users`: Updated with role_id and additional security fields
- `user_properties`: Maps users to specific properties they can access

### Permission Structure
Permissions follow the format: `{resource}:{action}`

**Resources:**
- properties, rooms, bookings, users, reports, system

**Actions:**
- create, read, update, delete, manage_staff, check_in, check_out, change_status, view_financial, view_occupancy, view_performance, admin

## Security Features

### Password Security
- Bcrypt hashing with 12 rounds
- Minimum 8 character requirement
- Password change functionality

### JWT Security
- Configurable secret key
- Separate access and refresh tokens
- Automatic token expiration

### Property Access Control
- Users can only access properties they're assigned to
- Super admins bypass property restrictions
- Property ownership tracked in `user_properties` table

### Rate Limiting
- Role-based rate limits
- Configurable limits per role type

## Admin Management

### User Management
```http
# Get all users (paginated)
GET /api/admin/users?page=1&limit=10&role=hotel_manager&search=john

# Create new user
POST /api/admin/users

# Update user
PUT /api/admin/users/:userId

# Deactivate user
DELETE /api/admin/users/:userId

# Assign user to property
POST /api/admin/users/:userId/properties
```

### System Statistics
```http
GET /api/admin/stats
```
Returns user counts by role, property/room/booking totals, active user metrics.

## Environment Configuration

Required environment variables:
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/hotel_db

# JWT Security
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

## Usage Examples

### Property Owner Workflow
1. Register/login as property owner
2. Create properties
3. Create room types and rooms for properties
4. Create staff accounts (front desk, housekeeping)
5. Assign staff to specific properties
6. Monitor bookings and reports

### Hotel Manager Workflow
1. Login with assigned credentials
2. Access assigned property dashboard
3. Manage daily operations (check-ins, check-outs)
4. Update room statuses
5. Handle booking modifications
6. Generate reports

### Front Desk Workflow
1. Login at start of shift
2. View today's arrivals/departures
3. Perform check-ins and check-outs
4. Update room availability
5. Handle guest requests

### Guest Workflow
1. Browse available properties (no login required)
2. Register account for booking
3. Make reservations
4. View booking history
5. Update profile information

## Error Handling

The system provides detailed error messages:
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `400 Bad Request`: Validation errors

## Future Enhancements

1. **Email Integration**: Password reset via email
2. **Two-Factor Authentication**: Enhanced security for admin accounts
3. **Audit Logging**: Track all user actions for compliance
4. **Dynamic Permissions**: Runtime permission modification
5. **Multi-tenant Support**: Complete property isolation
6. **API Rate Limiting**: Advanced rate limiting per endpoint
7. **Session Management**: Active session monitoring and control

## Migration Guide

To implement this RBAC system:

1. Run database migration: `npm run migrate up`
2. Install new dependencies: `npm install`
3. Update environment variables
4. Restart the application
5. Create initial super admin account
6. Configure property owners and staff

The system is backward compatible and existing data will be preserved during migration.