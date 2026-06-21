import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import styles from './BookingsPage.module.css';

const EMPTY = { groupName:'', from:'', to:'', departure:'', arrival:'', totalFare:'', perPax:'' };

export default function BookingsPage() {
  const { apiFetch } = useApi();
  const toast = useToast();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => apiFetch('/bookings').then(setBookings).catch(console.error);
  useEffect(() => { load(); }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/bookings', { method:'POST', body: JSON.stringify(form) });
      toast('success', 'Booking created!');
      setShowModal(false); setForm(EMPTY); load();
    } catch(err) { toast('error', 'Failed', err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id, e) {
    e.stopPropagation();
    if (!confirm('Delete this booking?')) return;
    await apiFetch(`/bookings/${id}`, { method:'DELETE' });
    toast('info', 'Booking deleted');
    load();
  }

  return (
    <div className="fu">
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Bookings</h1>
          <p className={styles.sub}>{bookings.length} group bookings</p>
        </div>
        <button className={styles.newBtn} onClick={() => setShowModal(true)}>+ New Booking</button>
      </div>

      <div className={styles.grid}>
        {bookings.map(b => (
          <div key={b.id} className={`${styles.card} ch`} onClick={() => navigate(`/bookings/${b.id}`)}>
            <div className={styles.cardTop}>
              <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
              <button className={styles.del} onClick={e => handleDelete(b.id, e)}>🗑</button>
            </div>
            <div className={styles.route}>{b.from} <span>→</span> {b.to}</div>
            <div className={styles.groupName}>{b.groupName}</div>
            <div className={styles.meta}>
              <span>✈ {new Date(b.departure).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
              <span>👥 {b.passengerCount} pax</span>
            </div>
            {b.totalFare > 0 && (
              <div className={styles.fare}>₹{b.totalFare.toLocaleString('en-IN')}</div>
            )}
          </div>
        ))}
        {bookings.length === 0 && <div className={styles.empty}>No bookings yet. Create one!</div>}
      </div>

      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>New Group Booking</h2>
            <form onSubmit={handleCreate} className={styles.form}>
              <input className="form-input" placeholder="Group name" value={form.groupName} onChange={set('groupName')} required />
              <div className={styles.row}>
                <input className="form-input" placeholder="From (e.g. HYD)" value={form.from} onChange={set('from')} required />
                <input className="form-input" placeholder="To (e.g. DEL)"   value={form.to}   onChange={set('to')}   required />
              </div>
              <div className={styles.row}>
                <div>
                  <label className={styles.label}>Departure</label>
                  <input className="form-input" type="datetime-local" value={form.departure} onChange={set('departure')} required />
                </div>
                <div>
                  <label className={styles.label}>Arrival</label>
                  <input className="form-input" type="datetime-local" value={form.arrival} onChange={set('arrival')} required />
                </div>
              </div>
              <div className={styles.row}>
                <input className="form-input" type="number" placeholder="Total fare (₹)" value={form.totalFare} onChange={set('totalFare')} />
                <input className="form-input" type="number" placeholder="Per pax (₹)"    value={form.perPax}    onChange={set('perPax')}    />
              </div>
              <div className={styles.actions}>
                <button type="button" className={styles.cancel} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.save} disabled={saving}>
                  {saving ? <span className="spinner"/> : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
