# Capstone Server

Backend server for the Capstone project providing API endpoints for admin, aircon, menu, and event management.

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd capstone/server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the values in `.env` with your configuration

4. Start the server:
```bash
npm start
```

## Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation

## API Endpoints

### Admin Routes
- GET `/api/admins` - Get all admins
- POST `/api/admins` - Create admin
- GET `/api/admins/:id` - Get admin by ID
- PATCH `/api/admins/:id` - Update admin
- DELETE `/api/admins/:id` - Delete admin
- POST `/api/login` - Admin login

### Aircon Routes
- GET `/api/aircon` - Get all aircons
- POST `/api/aircon` - Create aircon
- GET `/api/aircon/:id` - Get aircon by ID
- PATCH `/api/aircon/:id` - Update aircon
- DELETE `/api/aircon/:id` - Delete aircon

### Menu Routes
- GET `/api/menu` - Get all menu items
- POST `/api/menu` - Create menu item
- GET `/api/menu/:id` - Get menu item by ID
- PATCH `/api/menu/:id` - Update menu item
- DELETE `/api/menu/:id` - Delete menu item

### Event Routes
- GET `/api/events` - Get all events
- POST `/api/events` - Create event
- GET `/api/events/:id` - Get event by ID
- PATCH `/api/events/:id` - Update event
- DELETE `/api/events/:id` - Delete event
- GET `/api/events/assigned/:technicianId` - Get technician's assigned events
- GET `/api/tasks` - Get annual maintenance tasks

## Development

To seed test data:
```bash
node scripts/seedTestData.js
```