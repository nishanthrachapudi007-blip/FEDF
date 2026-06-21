// ── In-memory store ──────────────────────────────────────────────────────────
import { v4 as uuid } from 'uuid';

export const users = [
  { id: 'u1', firstName: 'Ravi', lastName: 'Kumar', email: 'ravi@example.com', password: 'password123', role: 'admin' },
  { id: 'u2', firstName: 'Priya', lastName: 'Sharma', email: 'priya@example.com', password: 'password123', role: 'user' },
];

export const bookings = [
  {
    id: 'b1',
    groupName: 'Tech Summit HYD',
    from: 'HYD',
    to: 'DEL',
    departure: '2025-03-15T09:15:00',
    arrival: '2025-03-15T11:45:00',
    status: 'Confirmed',
    totalFare: 384000,
    perPax: 16000,
    createdBy: 'u1',
    createdAt: '2025-02-10T10:00:00',
  },
  {
    id: 'b2',
    groupName: 'Family Reunion BOM',
    from: 'BOM',
    to: 'MAA',
    departure: '2025-04-02T14:30:00',
    arrival: '2025-04-02T16:10:00',
    status: 'Pending',
    totalFare: 210000,
    perPax: 15000,
    createdBy: 'u1',
    createdAt: '2025-03-01T08:30:00',
  },
  {
    id: 'b3',
    groupName: 'Corporate Offsite BLR',
    from: 'BLR',
    to: 'GOI',
    departure: '2025-05-10T07:00:00',
    arrival: '2025-05-10T08:20:00',
    status: 'Confirmed',
    totalFare: 156000,
    perPax: 13000,
    createdBy: 'u2',
    createdAt: '2025-04-15T12:00:00',
  },
];

export const passengers = [
  { id: 'p1', bookingId: 'b1', firstName: 'Ravi', lastName: 'Kumar', email: 'ravi@example.com', seat: '12A', paymentStatus: 'Paid', amount: 16000 },
  { id: 'p2', bookingId: 'b1', firstName: 'Priya', lastName: 'Sharma', email: 'priya@example.com', seat: '12B', paymentStatus: 'Paid', amount: 16000 },
  { id: 'p3', bookingId: 'b1', firstName: 'Anjali', lastName: 'Verma', email: 'anjali@example.com', seat: '12C', paymentStatus: 'Pending', amount: 16000 },
  { id: 'p4', bookingId: 'b1', firstName: 'Arjun', lastName: 'Mehta', email: 'arjun@example.com', seat: '13A', paymentStatus: 'Paid', amount: 16000 },
  { id: 'p5', bookingId: 'b2', firstName: 'Sita', lastName: 'Rao', email: 'sita@example.com', seat: '5C', paymentStatus: 'Pending', amount: 15000 },
  { id: 'p6', bookingId: 'b2', firstName: 'Kiran', lastName: 'Nair', email: 'kiran@example.com', seat: '5D', paymentStatus: 'Pending', amount: 15000 },
  { id: 'p7', bookingId: 'b3', firstName: 'Deepa', lastName: 'Patel', email: 'deepa@example.com', seat: '7A', paymentStatus: 'Paid', amount: 13000 },
  { id: 'p8', bookingId: 'b3', firstName: 'Rahul', lastName: 'Singh', email: 'rahul@example.com', seat: '7B', paymentStatus: 'Failed', amount: 13000 },
];

// Sessions store: token -> user id
export const sessions = new Map();

export function createUser(data) {
  const user = { id: uuid(), ...data, role: 'user' };
  users.push(user);
  return user;
}

export function createBooking(data) {
  const b = { id: uuid(), createdAt: new Date().toISOString(), status: 'Pending', ...data };
  bookings.push(b);
  return b;
}

export function updateBooking(id, data) {
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return null;
  bookings[idx] = { ...bookings[idx], ...data };
  return bookings[idx];
}

export function deleteBooking(id) {
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return false;
  bookings.splice(idx, 1);
  // cascade delete passengers
  const toRemove = passengers.filter(p => p.bookingId === id).map(p => p.id);
  toRemove.forEach(pid => { const i = passengers.findIndex(p => p.id === pid); if (i !== -1) passengers.splice(i, 1); });
  return true;
}

export function createPassenger(data) {
  const p = { id: uuid(), paymentStatus: 'Pending', ...data };
  passengers.push(p);
  return p;
}

export function updatePassenger(id, data) {
  const idx = passengers.findIndex(p => p.id === id);
  if (idx === -1) return null;
  passengers[idx] = { ...passengers[idx], ...data };
  return passengers[idx];
}

export function deletePassenger(id) {
  const idx = passengers.findIndex(p => p.id === id);
  if (idx === -1) return false;
  passengers.splice(idx, 1);
  return true;
}
