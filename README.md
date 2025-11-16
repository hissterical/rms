# Hotel Management System (RMS)

![System Architecture](./architecture-diagram.png)

> **Note:** Replace the image URL above with your actual architecture diagram

## Overview

A comprehensive hotel management platform with separate admin and guest interfaces. Admin staff manage operations via protected dashboards, while guests access services through QR codes.

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend:** Express.js, PostgreSQL (Port 5000 + 3001)
- **AI:** Groq API (Llama 3.3 70B Versatile)
- **Voice:** Web Speech API, SpeechSynthesis

## User Roles

| Role | Access | Capabilities |
|------|--------|-------------|
| **Admin/Manager** | Login Required | Full system access, analytics, bot configuration, property management |
| **Hotel Staff** | Login Required | Check-in/out, room management, service requests, QR generation |
| **Restaurant Staff** | Login Required | Menu CRUD, order processing, availability updates |
| **Guest** | QR-Based Public | Room services, food ordering, AI assistance (no login) |

## Key Features

### Admin Features
- **Room Management:** CRUD operations, 4 statuses (Available, Occupied, Cleaning, Maintenance), floor visualization
- **Check-In Process:** QR scan → Auto-populate → Document upload → Room assignment → Generate guest QR
- **Dashboard:** Occupancy rate, revenue tracking, analytics, quick actions
- **Food Management:** Menu CRUD in 8 languages (EN, ES, FR, DE, IT, CN, JP, AR), categories, dietary info
- **Bot Configuration:** Upload hotel knowledge base (.txt), configure chatbot/voice assistant responses
- **Service Requests:** View/manage guest requests (Housekeeping, Maintenance, Concierge)

### Guest Features
- **Room Services:** Request housekeeping, maintenance, essentials, concierge via QR code
- **Food Ordering:** 8-language menu, voice search, cart management, group ordering, bill splitting
- **AI Assistance:** 
  - Text chatbot (floating button on service pages)
  - Voice assistant (speak requests, get voice replies)
  - Strict knowledge base adherence (no hallucinations)

## Architecture

### Frontend (Next.js 14)
```
/app          - Pages (dashboard, room-management, room-services, food)
/components   - Reusable components (chatbot, voice-assistant, qr-scanner)
/contexts     - State management (guest-context, hotel-context)
/lib          - Utilities (api, bot-config, qr-utils)
```

### Backend
- **Main (Port 5000):** Properties, Rooms, Bookings, Service Requests
- **QR (Port 3001):** Menu CRUD, Order Processing

### Database (PostgreSQL)
Tables: properties, rooms, room_types, bookings, guests, service_requests, restaurants, menu_items, orders, order_items

## Workflows

**Guest Journey:**
1. Book room → Receive booking QR
2. Check-in → Staff scans QR → Upload ID → Assign room → Generate room QR
3. In-room → Scan room QR → Access /room-services → Request services
4. Dining → Scan menu QR → Order food
5. AI Help → Use chatbot/voice (WiFi, check-out, amenities)
6. Check-out → Staff changes room to "Cleaning"

**Staff Workflows:**
- **Front Desk:** QR scanner check-in, assign rooms, generate QR codes
- **Housekeeping:** View requests, mark rooms "Available"
- **Maintenance:** Prioritize requests, update status
- **Restaurant:** Update menu, process orders
- **Manager:** View analytics, configure AI bot, manage inventory

## Setup

### Requirements
- Node.js 18+
- PostgreSQL 14+
- Groq API key

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_RESTAURANT_API_URL=http://localhost:3001
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
DATABASE_URL=postgresql://user:password@localhost:5432/rms
```

### Quick Start
```bash
# Install dependencies
npm install

# Run migrations
npm run migrate

# Start backends
cd back && npm start    # Port 5000
cd qrback && npm start  # Port 3001

# Start frontend
cd FRONTEND && npm run dev  # localhost:3000
```

## Security

**Current:**
- HTTPS, environment variables, CORS, input validation

**Planned:**
- JWT authentication with role-based access
- Protected admin routes
- QR expiration, data encryption
- GDPR compliance, API rate limiting

## Future Enhancements

- Payment gateway integration
- Email/SMS notifications
- Mobile app (React Native)
- Multi-property management
- Booking platform integration (Booking.com, Airbnb)
- AI: Sentiment analysis, predictive maintenance, demand forecasting
- Smart lock & IoT device control

## License

Proprietary

---

**Version:** 1.0  
**Status:** Development (Authentication Pending)  
**Last Updated:** November 16, 2025

