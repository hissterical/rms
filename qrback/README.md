# QR Menu Creator - Restaurant SaaS

A SaaS application for restaurants to create QR code menus for their tables.

## Features

- Restaurant registration with basic details
- Automatic QR code generation for each table
- QR codes saved as PNG files in organized directories
- Web interface to register restaurants and view QR codes
- PostgreSQL database for storing restaurant and table data

## Setup Instructions

### Prerequisites

- Node.js (or Bun)
- PostgreSQL database

### Installation

1. Clone the repository and navigate to the qrback folder
2. Install dependencies:

   ```bash
   npm install
   # or if using Bun
   bun install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
4. Edit the `.env` file with your database credentials:

   ```properties
   PG_USER=postgres
   PG_HOST=localhost
   PG_DATABASE=your_database_name
   PG_PASSWORD=your_password
   PG_PORT=5432
   APP_DOMAIN=localhost:3000
   ```

5. Run the database migration:

   ```sql
   -- Execute the SQL in migrations/001_init.sql in your PostgreSQL database
   ```

6. Start the server:

   ```bash
   npm start
   # or
   node index.js
   ```

7. Open your browser and go to `http://localhost:3000`

## API Endpoints

- `POST /api/restaurants/create` - Register a new restaurant
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id/tables` - Get all tables for a restaurant

## File Structure

- `storage/qrs/[restaurant_id]/` - QR code images for each restaurant
- `public/index.html` - Frontend interface
- `routes/restaurants.js` - Restaurant API routes
- `routes/testFrontend.js` - Frontend serving route
- `setup/db.js` - Database connection setup
- `migrations/001_init.sql` - Database schema

## Usage

1. Fill out the restaurant registration form
2. Specify the number of tables
3. Click "Create Restaurant & Generate QR Codes"
4. QR codes will be generated and displayed
5. QR codes are saved as PNG files in `storage/qrs/[restaurant_id]/`
6. View all registered restaurants and their QR codes below the form

Each QR code contains a unique URL for the restaurant's table menu.
bun install

````

To run:

```bash
bun run index.ts
````

This project was created using `bun init` in bun v1.2.18. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
