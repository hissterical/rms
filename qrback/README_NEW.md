# QR Menu SaaS System - Complete Implementation

A complete QR menu management system for restaurants that allows restaurant owners to manage their digital menus and provides QR code access for customers.

## 🎯 What's New - Complete Admin System

This system now includes a full admin panel where restaurant owners can:

- **Login securely** with email/password authentication
- **Manage menu items** with full CRUD operations
- **Upload images** for menu items
- **Organize by categories** (Appetizers, Main Course, etc.)
- **Toggle availability** of items in real-time
- **View beautiful customer menus** accessible via QR codes

## Features

### For Restaurant Owners:

- **Restaurant Registration**: Register with admin credentials and table count
- **Admin Dashboard**: Secure login to manage menu items
- **Menu Management**: Add, edit, delete, and toggle availability of menu items
- **Image Upload**: Upload images for menu items (max 5MB)
- **Category Organization**: Organize menu items by categories
- **QR Code Generation**: Automatic QR code generation for each table

### For Customers:

- **Mobile-Friendly Menu**: Beautiful, responsive menu display
- **QR Code Access**: Scan QR codes to view restaurant menus
- **Real-time Updates**: Menu changes reflect immediately for customers

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install bcryptjs jsonwebtoken multer cors
```

### 2. Database Setup

Run the database migrations:

```sql
-- Execute migrations/001_init.sql first
-- Then execute migrations/002_add_admin_auth.sql
```

### 3. Start the Server

```bash
npm start
```

### 4. Access the System

- **Register Restaurant**: Visit `http://localhost:3000/register.html`
- **Admin Login**: Visit `http://localhost:3000/admin-login.html`
- **Customer Menu**: Scan QR codes or visit `/menu/:restaurantId/:tableNumber`

## API Endpoints

### Restaurant Management

- `POST /api/restaurants/create` - Register a new restaurant (now creates admin account)
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id/tables` - Get tables for a restaurant

### Admin Authentication

- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/change-password` - Change admin password

### Menu Management (Admin)

- `GET /api/menus/admin` - Get all menu items (admin)
- `POST /api/menus/admin` - Create menu item (with image upload)
- `PUT /api/menus/admin/:id` - Update menu item
- `DELETE /api/menus/admin/:id` - Delete menu item

### Public Menu Access

- `GET /api/menus/:restaurantId/:tableNumber` - Get menu for customers

## Frontend Pages

### Admin Pages:

- `/register.html` - Restaurant registration with admin setup
- `/admin-login.html` - Secure admin login
- `/admin-panel.html` - Complete menu management dashboard

### Customer Pages:

- `/menu/:restaurantId/:tableNumber` - Beautiful customer menu display

## Database Schema

### New Tables Added:

- `restaurant_admins` - Admin authentication with JWT
- Enhanced `menu_items` with availability, sort order, timestamps

### Complete Schema:

- `restaurants` - Restaurant information
- `restaurant_admins` - Admin accounts with hashed passwords
- `tables` - Table information with QR codes
- `menu_items` - Menu items with images, categories, availability

## How the Complete System Works

### 1. Restaurant Registration Process:

```
Owner visits /register.html
  ↓
Fills form (name, email, tables, password)
  ↓
System creates:
- Restaurant record
- Admin account (hashed password)
- QR codes for each table
- Storage directories for images
```

### 2. Admin Menu Management:

```
Owner logs in at /admin-login.html
  ↓
JWT token authentication
  ↓
Access /admin-panel.html dashboard
  ↓
CRUD operations on menu items:
- Add items with images
- Edit descriptions and prices
- Toggle availability
- Organize by categories
```

### 3. Customer Experience:

```
Customer scans QR code at table
  ↓
Redirects to /menu/:restaurantId/:tableNumber
  ↓
Displays beautiful, mobile-friendly menu
  ↓
Real-time updates when admin changes menu
```

## Security Features

- **JWT Authentication**: Secure token-based admin sessions
- **Password Hashing**: bcrypt with salt rounds for security
- **File Upload Validation**: Image type and size validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Proper cross-origin handling

## File Structure

```
qrback/
├── index.js                 # Main server with all routes
├── routes/
│   ├── restaurants.js      # Restaurant registration (updated)
│   ├── adminAuth.js        # Admin authentication (NEW)
│   ├── menus.js           # Complete menu management (NEW)
│   └── testFrontend.js    # Test routes
├── public/
│   ├── register.html       # Restaurant registration (updated)
│   ├── admin-login.html    # Admin login page (NEW)
│   ├── admin-panel.html    # Menu management dashboard (NEW)
│   └── menu.html          # Customer menu display (NEW)
├── storage/
│   ├── qrs/               # QR code images
│   └── menu-images/       # Menu item images (NEW)
└── migrations/
    ├── 001_init.sql       # Initial database schema
    └── 002_add_admin_auth.sql # Admin authentication (NEW)
```

## Environment Variables

Create a `.env` file:

```env
JWT_SECRET=your-very-secure-jwt-secret-key-here
APP_DOMAIN=localhost:3000
# Add your database configuration
```

## Example Usage Flow

1. **Restaurant Owner**:

   - Registers at `/register.html` with 5 tables
   - Gets admin login credentials
   - Logs into admin panel
   - Adds menu items: "Chicken Burger $12.99", "Caesar Salad $8.50"
   - Uploads food images
   - Organizes into "Main Course" and "Salads" categories

2. **Customer**:
   - Sits at Table 3
   - Scans QR code
   - Views mobile-friendly menu with images
   - Sees real-time updates when owner modifies menu

## Next Steps / Features to Add

- Order management system
- Payment integration
- Multi-language support
- Analytics dashboard
- Email notifications
- Table reservation system

The system is now a complete QR menu SaaS solution ready for production use!
