# Auth System Test Guide

## Manual Testing Steps

### 1. Test User Registration (Property Owner)

**Endpoint**: `POST http://localhost:5000/api/users/register`

**Request Body**:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "property_owner"
}
```

**Expected Response**:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "property_owner",
    "created_at": "timestamp"
  },
  "token": "jwt-token"
}
```

### 2. Test Login

**Endpoint**: `POST http://localhost:5000/api/users/login`

**Request Body**:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response**:

```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "jwt-token"
}
```

### 3. Test Create Property (Authenticated)

**Endpoint**: `POST http://localhost:5000/api/properties`

**Headers**:

```
Authorization: Bearer {your-jwt-token}
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "Grand Hotel",
  "address": "123 Main St, City",
  "description": "A beautiful hotel",
  "property_type": "Hotel",
  "phone": "+1234567890",
  "website": "https://grandhotel.com"
}
```

**Expected Response**: Property object with owner_id set to authenticated user

### 4. Test Get My Properties

**Endpoint**: `GET http://localhost:5000/api/users/my-properties`

**Headers**:

```
Authorization: Bearer {your-jwt-token}
```

**Expected Response**:

```json
{
  "properties": [
    {
      "id": "uuid",
      "name": "Grand Hotel",
      ...
    }
  ]
}
```

### 5. Test Manager Registration and Assignment

**Step 1**: Register a manager

```json
POST http://localhost:5000/api/users/register
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "manager"
}
```

**Step 2**: Assign manager to property (as property owner)

```json
POST http://localhost:5000/api/users/properties/{propertyId}/managers
{
  "propertyId": "property-uuid",
  "managerId": "manager-uuid"
}
```

**Step 3**: Login as manager and get assigned properties

```json
GET http://localhost:5000/api/users/my-properties
```

### 6. Test Role-Based Access

**Scenario**: Manager tries to create property (should fail)

**Endpoint**: `POST http://localhost:5000/api/properties`

**Headers**: Authorization with manager's token

**Expected Response**: 403 Forbidden

### 7. Test Property Access Control

**Scenario**: User A tries to access User B's property (should fail)

**Endpoint**: `GET http://localhost:5000/api/properties/{user-b-property-id}`

**Headers**: Authorization with User A's token

**Expected Response**: 403 Forbidden

## Frontend Testing

### 1. Test Registration Flow

1. Navigate to `http://localhost:3000/register`
2. Select "Property Owner" role
3. Fill in details and submit
4. Should redirect to `/dashboard/properties`

### 2. Test Login Flow

1. Navigate to `http://localhost:3000/login`
2. Enter credentials
3. Should redirect to `/dashboard/properties` (for owners/managers) or `/dashboard` (for customers)

### 3. Test Property Creation

1. Login as property owner
2. Click "Add New Property"
3. Fill in property details
4. Submit
5. Should redirect back to properties list
6. New property should appear

### 4. Test Property Selection

1. Login as property owner with multiple properties
2. Click on any property card
3. Should redirect to `/dashboard`
4. Dashboard should load with selected property context

### 5. Test Protected Routes

1. Try accessing `/dashboard` without logging in
2. Should redirect to `/login`

### 6. Test Manager Flow

1. Login as manager (after being assigned to a property)
2. Should see assigned properties
3. Can access dashboard for assigned properties
4. Cannot create new properties

## Common Issues

### 1. Token Not Being Sent

- Check localStorage for 'token' key
- Verify Authorization header is included in requests

### 2. CORS Errors

- Ensure backend has cors() middleware
- Check backend is running on port 5000
- Check frontend is on port 3000

### 3. 401 Unauthorized

- Token might be expired (7 day expiry)
- Token might be invalid
- Re-login to get fresh token

### 4. 403 Forbidden

- User doesn't have required role
- User doesn't have access to the property
- Verify role in user object

### 5. Database Errors

- Ensure all migrations have run
- Check database connection
- Verify user exists and has correct role
