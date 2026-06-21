import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import styles from './PassengersPage.module.css';

export default function PassengersPage() {
  const { apiFetch } = useApi();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/bookings').then(async bs => {
      const withPax = await Promise.all(bs.map(async b => {
        const detail = await apiFetch(`/bookings/${b.id}`);
        return { ...b, passengers: detail.passengers || [] };
      }));
      setBookings(withPax);
    }).catch(console.error);
  }, []);

  const allPax = bookings.flatMap(b =>
    b.passengers.map(p => ({ ...p, bookingName: b.groupName, bookingId: b.id }))
  );

  const filtered = allPax.filter(p => {
    const q = search.toLowerCase();
    return !q || `${p.firstName} ${p.lastName} ${p.email}`.toLowerCase().includes(q);
  });

  return (
    <div className="fu">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Passengers</h1>
          <p className={styles.sub}>{allPax.length} total across all bookings</p>
        </div>
        <input
          className={`form-input ${styles.search}`}
          placeholder="🔍 Search passengers…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.table}>
        <div className={styles.thead}>
          <span>Name</span><span>Email</span><span>Booking</span><span>Seat</span><span>Amount</span><span>Payment</span>
        </div>
        {filtered.map(p => (
          <div key={p.id} className={styles.row} onClick={() => navigate(`/bookings/${p.bookingId}`)}>
            <span className={styles.name}>{p.firstName} {p.lastName}</span>
            <span className={styles.email}>{p.email}</span>
            <span className={styles.booking}>{p.bookingName}</span>
            <span className={styles.seat}>{p.seat || '—'}</span>
            <span>{p.amount ? `₹${p.amount.toLocaleString('en-IN')}` : '—'}</span>
            <span><span className={`badge badge-${p.paymentStatus.toLowerCase()}`}>{p.paymentStatus}</span></span>
          </div>
        ))}
        {filtered.length === 0 && <div className={styles.empty}>No passengers found.</div>}
      </div>
    </div>
  );
}
