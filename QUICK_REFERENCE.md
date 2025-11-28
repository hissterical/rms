# Quick Reference Card

## 🚀 Start the Application

```bash
# Terminal 1 - Backend
cd back
npm install
npm run migrate up
npm run dev

# Terminal 2 - Frontend
cd FRONTEND
npm install
npm run dev
```

## 🔑 User Roles

| Role                 | Capabilities                                             |
| -------------------- | -------------------------------------------------------- |
| **property_owner**   | Create properties, assign managers, full property access |
| **manager**          | Access assigned properties only                          |
| **website_customer** | Online bookings (pending)                                |
| **offline_customer** | Walk-in bookings (pending)                               |

## 📍 Key Routes

### Frontend

- `/register` - Sign up with role selection
- `/login` - Sign in
- `/dashboard/properties` - View all properties (owner/manager)
- `/dashboard/properties/new` - Create property (owner only)
- `/dashboard` - Property management dashboard

### Backend API

- `POST /api/users/register` - Register
- `POST /api/users/login` - Login
- `GET /api/users/my-properties` - List properties
- `POST /api/properties` - Create property (auth required)
- `GET /api/properties/:id` - Get property (auth required)

## 🔐 Authentication

**Request Header:**

```
Authorization: Bearer <jwt-token>
```

**Token automatically added by frontend when using:**

- `propertyAPI.*` methods
- `useAuth()` hook

## 💾 Data Flow

1. User registers → Receives JWT token → Stored in localStorage
2. Token sent with all API requests in Authorization header
3. Backend validates token and role before processing
4. Property owner creates property → Links to their user_id
5. Property owner selects property → Stored in localStorage
6. Dashboard uses selected property for all operations

## 🎯 First-Time Setup Checklist

- [ ] Backend: `npm install`
- [ ] Backend: Create `.env` with `JWT_SECRET`
- [ ] Backend: `npm run migrate up`
- [ ] Backend: `npm run dev`
- [ ] Frontend: `npm install`
- [ ] Frontend: `npm run dev`
- [ ] Register property owner account
- [ ] Create first property
- [ ] Test property access

## 🐛 Quick Troubleshooting

**"401 Unauthorized"**
→ Token expired or invalid, re-login

**"403 Forbidden"**  
→ Wrong role or no property access

**"Can't connect to backend"**
→ Check backend is running on port 5000

**"Redirected to /login"**
→ Not authenticated, need to login

**"Redirected to /properties"**
→ No property selected, select one first

## 📦 New Files Summary

**Backend:**

- `middleware/auth.js`
- `services/userService.js`
- `controllers/userController.js`
- `routes/userRoutes.js`
- `migrations/004_add_property_managers.sql`

**Frontend:**

- `contexts/auth-context.tsx`
- `lib/property-api.ts`
- `app/register/page.tsx`
- `app/dashboard/properties/page.tsx`
- `app/dashboard/properties/new/page.tsx`

## 🔧 Environment Variables

**back/.env:**

```env
PORT=5000
JWT_SECRET=change-this-to-random-string-in-production
DATABASE_URL=postgresql://...
```

## ✨ Pro Tips

1. **Use the register page** (`/register`) instead of old signup page
2. **Property owners must select a property** before accessing dashboard
3. **Managers see only assigned properties** in their list
4. **All property endpoints are protected** - must be authenticated
5. **JWT tokens expire in 7 days** - users need to re-login after

---

Need help? Check:

- `IMPLEMENTATION_SUMMARY.md` - Full feature list
- `SETUP_GUIDE.md` - Detailed setup steps
- `TESTING_GUIDE.md` - Test scenarios
- `AUTH_IMPLEMENTATION.md` - Technical details
