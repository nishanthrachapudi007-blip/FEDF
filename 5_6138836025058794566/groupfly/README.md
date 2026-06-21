# ✈ GroupFly — Group Booking Management

A full-stack web app built with **Vite + React** (frontend) and **Node + Express** (backend), using in-memory data (no database needed).

---

## Project Structure

```
groupfly/
├── client/          # Vite + React frontend (port 3000)
│   └── src/
│       ├── pages/   # HomePage, Dashboard, Bookings, Passengers, Seats, Payments
│       ├── context/ # Auth + Toast context
│       ├── hooks/   # useApi (authenticated fetch)
│       └── components/ # Layout / Sidebar
│
├── server/          # Node + Express backend (port 4000)
│   ├── index.js     # All API routes
│   └── store.js     # In-memory data + CRUD helpers
│
└── package.json     # Root scripts to run both together
```

---

## Quick Start

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Run both servers
```bash
npm install        # install concurrently
npm run dev        # starts server on :4000 and client on :3000
```

Or run separately:
```bash
npm run dev:server   # terminal 1
npm run dev:client   # terminal 2
```

Open **http://localhost:3000**

---

## Demo Login
| Email | Password |
|-------|----------|
| ravi@example.com | password123 |
| priya@example.com | password123 |

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Login / Sign Up |
| Dashboard | `/dashboard` | Stats + recent bookings |
| Bookings | `/bookings` | List, create, delete bookings |
| Booking Detail | `/bookings/:id` | Passengers, add/remove |
| Seat Map | `/seats/:bookingId` | Visual seat allocation |
| Passengers | `/passengers` | All passengers, searchable |
| Payments | `/payments` | Mark paid/pending per passenger |

---

## API Endpoints

### Auth
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

### Bookings
- `GET    /api/bookings`
- `POST   /api/bookings`
- `GET    /api/bookings/:id`
- `PUT    /api/bookings/:id`
- `DELETE /api/bookings/:id`

### Passengers
- `GET    /api/bookings/:bookingId/passengers`
- `POST   /api/bookings/:bookingId/passengers`
- `PUT    /api/passengers/:id`
- `DELETE /api/passengers/:id`

### Stats
- `GET /api/stats`
