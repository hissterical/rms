# Hotel Management System - Role-Based Authentication

A complete hotel management system with role-based authentication, property management, and dashboard access control.

## 🎯 Features

- **Role-Based Authentication**: Property owners, managers, and customers with different access levels
- **Property Management**: Create, view, and manage multiple properties
- **Manager Assignment**: Property owners can assign managers to their properties
- **Protected Routes**: Role-based access control for all features
- **JWT Authentication**: Secure token-based authentication
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- npm or pnpm package manager

### Installation

1. **Clone the repository** (if not already done)

2. **Install Backend Dependencies**

   ```bash
   cd back
   npm install
   ```

3. **Set up Environment Variables**

   Create `back/.env`:

   ```env
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   DATABASE_URL=postgresql://user:password@localhost:5432/your_database
   ```

4. **Run Database Migrations**

   ```bash
   cd back
   npm run migrate up
   ```

   Or use the helper script:

   - Windows: `run-migrations.bat`
   - Mac/Linux: `chmod +x run-migrations.sh && ./run-migrations.sh`

5. **Start Backend Server**

   ```bash
   cd back
   npm run dev
   ```

   Server will run on http://localhost:5000

6. **Install Frontend Dependencies**

   ```bash
   cd FRONTEND
   npm install
   # or
   pnpm install
   ```

7. **Start Frontend Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   Frontend will run on http://localhost:3000

## 👥 User Roles

| Role                 | Description                 | Capabilities                                                        |
| -------------------- | --------------------------- | ------------------------------------------------------------------- |
| **Property Owner**   | Owns and creates properties | Create properties, assign managers, full access to owned properties |
| **Manager**          | Manages assigned properties | Access assigned properties, manage rooms and bookings               |
| **Website Customer** | Books online                | Online room booking (pending implementation)                        |
| **Offline Customer** | Walk-in guest               | Walk-in bookings (pending implementation)                           |

## 📱 User Flow

### Property Owner

1. Register at `/register` with "Property Owner" role
2. Create properties from the dashboard
3. Click on any property to manage it
4. Assign managers to properties (via API)

### Manager

1. Register at `/register` with "Manager" role
2. Wait for property owner to assign you to properties
3. View and manage assigned properties
4. Cannot create new properties

## 🗂️ Project Structure

```
rms_gay/
├── back/                          # Backend (Express + TypeScript)
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── middleware/
│   │   └── auth.js               # Authentication middleware ⭐ NEW
│   ├── controllers/
│   │   ├── userController.js     # User/auth controllers ⭐ NEW
│   │   └── propertyController.js
│   ├── services/
│   │   ├── userService.js        # User business logic ⭐ NEW
│   │   └── propertyService.js
│   ├── routes/
│   │   ├── userRoutes.js         # User/auth routes ⭐ NEW
│   │   └── propertyRoutes.js
│   ├── migrations/
│   │   ├── 001_init.sql
│   │   ├── 002_add_details.sql
│   │   ├── 003_drop_booking_id_from_rooms.sql
│   │   └── 004_add_property_managers.sql ⭐ NEW
│   └── index.ts
│
├── FRONTEND/                      # Frontend (Next.js 14)
│   ├── app/
│   │   ├── layout.tsx            # Updated with AuthProvider ⭐
│   │   ├── register/
│   │   │   └── page.tsx          # Role-based signup ⭐ NEW
│   │   ├── login/
│   │   │   └── page.tsx          # Updated login ⭐
│   │   └── dashboard/
│   │       ├── layout.tsx        # Auth guard ⭐ NEW
│   │       ├── page.tsx          # Main dashboard
│   │       └── properties/
│   │           ├── page.tsx      # Property list ⭐ NEW
│   │           └── new/
│   │               └── page.tsx  # Create property ⭐ NEW
│   ├── contexts/
│   │   ├── auth-context.tsx      # Auth state management ⭐ NEW
│   │   ├── property-context.tsx  # Property selection ⭐ NEW
│   │   ├── hotel-context.tsx
│   │   └── guest-context.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   └── property-api.ts       # Property API helpers ⭐ NEW
│   └── components/
│
├── AUTH_IMPLEMENTATION.md         # Technical details ⭐ NEW
├── SETUP_GUIDE.md                # Setup instructions ⭐ NEW
├── TESTING_GUIDE.md              # Testing procedures ⭐ NEW
├── IMPLEMENTATION_SUMMARY.md      # Feature summary ⭐ NEW
├── QUICK_REFERENCE.md            # Quick reference ⭐ NEW
├── run-migrations.bat            # Migration helper (Windows) ⭐ NEW
└── run-migrations.sh             # Migration helper (Mac/Linux) ⭐ NEW
```

## 🔌 API Endpoints

### Authentication

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (authenticated)
- `PUT /api/users/profile` - Update user profile (authenticated)

### Property Management

- `GET /api/users/my-properties` - Get all properties for user
- `POST /api/properties` - Create property (property_owner only)
- `GET /api/properties/:id` - Get property (requires access)
- `PATCH /api/properties/:id` - Update property (requires access)
- `DELETE /api/properties/:id` - Delete property (requires access)

### Manager Assignment

- `POST /api/users/properties/:id/managers` - Assign manager
- `DELETE /api/users/properties/:id/managers` - Remove manager
- `GET /api/users/properties/:id/managers` - List managers

All authenticated endpoints require:

```
Authorization: Bearer <jwt-token>
```

## 🔐 Security

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: 7-day expiry
- **Role-Based Access**: Middleware validates user roles
- **Property Access Control**: Checks ownership or manager assignment
- **CORS Enabled**: For frontend-backend communication

## 📚 Documentation

- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick start commands and tips
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Complete feature list
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - API testing examples
- **[AUTH_IMPLEMENTATION.md](./AUTH_IMPLEMENTATION.md)** - Technical implementation

## 🐛 Troubleshooting

**Backend won't start:**

- Check if PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Ensure migrations have run

**Frontend errors:**

- Run `npm install` in FRONTEND folder
- Check backend is running on port 5000

**Authentication issues:**

- Clear localStorage and re-login
- Check JWT_SECRET is set in backend `.env`
- Verify token in Authorization header

**Migration errors:**

- Ensure migrations run in order (001, 002, 003, 004)
- Check database connection
- Review migration logs

## 🔄 Development Workflow

1. **Backend** runs on port 5000
2. **Frontend** runs on port 3000
3. Backend API at `http://localhost:5000/api`
4. Frontend dev server at `http://localhost:3000`

## 🎨 Tech Stack

**Backend:**

- Express.js
- TypeScript
- PostgreSQL
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- node-pg-migrate (migrations)

**Frontend:**

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion (animations)

## 📝 License

This project is part of a hotel management system implementation.

## 🤝 Contributing

1. Ensure all migrations are run
2. Test authentication flows
3. Verify role-based access
4. Check both owner and manager workflows

## ⚠️ Important Notes

- Change `JWT_SECRET` in production
- Use environment variables for sensitive data
- Run migrations before starting the application
- Property owners must select a property before accessing the dashboard
- Managers can only see properties they're assigned to

---

**Need Help?** Check the documentation files or review the testing guide for common scenarios.
