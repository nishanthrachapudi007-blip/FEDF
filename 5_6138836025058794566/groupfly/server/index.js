import express from 'express';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import {
  users, bookings, passengers, sessions,
  createUser, createBooking, updateBooking, deleteBooking,
  createPassenger, updatePassenger, deletePassenger,
} from './store.js';

const app = express();
app.use(cors());
app.use(express.json());

// ── Auth middleware ────────────────────────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token || !sessions.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  req.user = users.find(u => u.id === sessions.get(token));
  next();
}

// ═══════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════
app.post('/api/auth/signup', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password)
    return res.status(400).json({ error: 'All fields required' });
  if (users.find(u => u.email === email))
    return res.status(409).json({ error: 'Email already in use' });
  const user = createUser({ firstName, lastName, email, password });
  const token = uuid();
  sessions.set(token, user.id);
  const { password: _, ...safe } = user;
  res.status(201).json({ token, user: safe });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const token = uuid();
  sessions.set(token, user.id);
  const { password: _, ...safe } = user;
  res.json({ token, user: safe });
});

app.post('/api/auth/logout', auth, (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  sessions.delete(token);
  res.json({ ok: true });
});

app.get('/api/auth/me', auth, (req, res) => {
  const { password: _, ...safe } = req.user;
  res.json(safe);
});

// ═══════════════════════════════════════════════════════════
// BOOKINGS ROUTES
// ═══════════════════════════════════════════════════════════
app.get('/api/bookings', auth, (req, res) => {
  const enriched = bookings.map(b => ({
    ...b,
    passengerCount: passengers.filter(p => p.bookingId === b.id).length,
  }));
  res.json(enriched);
});

app.get('/api/bookings/:id', auth, (req, res) => {
  const b = bookings.find(b => b.id === req.params.id);
  if (!b) return res.status(404).json({ error: 'Not found' });
  const pax = passengers.filter(p => p.bookingId === b.id);
  res.json({ ...b, passengers: pax });
});

app.post('/api/bookings', auth, (req, res) => {
  const { groupName, from, to, departure, arrival, totalFare, perPax } = req.body;
  if (!groupName || !from || !to || !departure || !arrival)
    return res.status(400).json({ error: 'Missing required fields' });
  const b = createBooking({ groupName, from, to, departure, arrival, totalFare: Number(totalFare), perPax: Number(perPax), createdBy: req.user.id });
  res.status(201).json(b);
});

app.put('/api/bookings/:id', auth, (req, res) => {
  const updated = updateBooking(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/bookings/:id', auth, (req, res) => {
  if (!deleteBooking(req.params.id)) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════
// PASSENGERS ROUTES
// ═══════════════════════════════════════════════════════════
app.get('/api/bookings/:bookingId/passengers', auth, (req, res) => {
  res.json(passengers.filter(p => p.bookingId === req.params.bookingId));
});

app.post('/api/bookings/:bookingId/passengers', auth, (req, res) => {
  const { firstName, lastName, email, seat, amount } = req.body;
  if (!firstName || !lastName || !email)
    return res.status(400).json({ error: 'Missing required fields' });
  const p = createPassenger({ bookingId: req.params.bookingId, firstName, lastName, email, seat, amount: Number(amount) });
  res.status(201).json(p);
});

app.put('/api/passengers/:id', auth, (req, res) => {
  const updated = updatePassenger(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

app.delete('/api/passengers/:id', auth, (req, res) => {
  if (!deletePassenger(req.params.id)) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════
// STATS ROUTE
// ═══════════════════════════════════════════════════════════
app.get('/api/stats', auth, (req, res) => {
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed').length;
  const totalPassengers = passengers.length;
  const totalRevenue = passengers.filter(p => p.paymentStatus === 'Paid').reduce((s, p) => s + (p.amount || 0), 0);
  const pendingPayments = passengers.filter(p => p.paymentStatus === 'Pending').length;
  res.json({ totalBookings, confirmedBookings, totalPassengers, totalRevenue, pendingPayments });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`GroupFly API → http://localhost:${PORT}`));
