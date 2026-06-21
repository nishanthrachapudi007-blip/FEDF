import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import styles from './Dashboard.module.css';

function StatCard({ label, value, icon, color }) {
  return (
    <div className={`${styles.stat} ch`} style={{ '--accent': color }}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statVal}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { apiFetch } = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    apiFetch('/stats').then(setStats).catch(console.error);
    apiFetch('/bookings').then(d => setBookings(d.slice(0,5))).catch(console.error);
  }, []);

  const fmt = n => `₹${(n/1000).toFixed(0)}k`;

  return (
    <div className="fu">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.sub}>Welcome back, {user?.firstName}!</p>
        </div>
        <button className={styles.newBtn} onClick={() => navigate('/bookings')}>+ New Booking</button>
      </div>

      <div className={styles.stats}>
        <StatCard label="Total Bookings"   value={stats?.totalBookings ?? '—'}    icon="✈" color="var(--sky)"     />
        <StatCard label="Confirmed"        value={stats?.confirmedBookings ?? '—'} icon="✅" color="var(--success)" />
        <StatCard label="Total Passengers" value={stats?.totalPassengers ?? '—'}   icon="👥" color="var(--gold)"   />
        <StatCard label="Revenue Collected" value={stats ? fmt(stats.totalRevenue) : '—'} icon="💰" color="#a78bfa" />
        <StatCard label="Pending Payments" value={stats?.pendingPayments ?? '—'}  icon="⏳" color="var(--warning)" />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Bookings</h2>
        <div className={styles.table}>
          <div className={styles.thead}>
            <span>Group</span><span>Route</span><span>Date</span><span>Passengers</span><span>Status</span>
          </div>
          {bookings.map(b => (
            <div key={b.id} className={styles.row} onClick={() => navigate(`/bookings/${b.id}`)}>
              <span className={styles.name}>{b.groupName}</span>
              <span className={styles.route}>{b.from} → {b.to}</span>
              <span>{new Date(b.departure).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</span>
              <span>{b.passengerCount} pax</span>
              <span><span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span></span>
            </div>
          ))}
          {bookings.length === 0 && <div className={styles.empty}>No bookings yet.</div>}
        </div>
      </div>
    </div>
  );
}
