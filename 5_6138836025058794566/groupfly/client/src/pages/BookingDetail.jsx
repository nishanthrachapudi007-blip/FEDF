import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import styles from './BookingDetail.module.css';

export default function BookingDetail() {
  const { id } = useParams();
  const { apiFetch } = useApi();
  const toast = useToast();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', seat:'', amount:'' });
  const [saving, setSaving] = useState(false);

  const load = () => apiFetch(`/bookings/${id}`).then(setBooking).catch(console.error);
  useEffect(() => { load(); }, [id]);

  const set = k => e => setForm(f => ({...f, [k]: e.target.value}));

  async function addPassenger(e) {
    e.preventDefault(); setSaving(true);
    try {
      await apiFetch(`/bookings/${id}/passengers`, { method:'POST', body: JSON.stringify(form) });
      toast('success', 'Passenger added');
      setShowAdd(false); setForm({ firstName:'', lastName:'', email:'', seat:'', amount:'' });
      load();
    } catch(err) { toast('error', 'Failed', err.message); }
    finally { setSaving(false); }
  }

  async function removePassenger(pid) {
    if (!confirm('Remove passenger?')) return;
    await apiFetch(`/passengers/${pid}`, { method:'DELETE' });
    toast('info', 'Removed'); load();
  }

  if (!booking) return <div style={{padding:40,color:'var(--muted)'}}>Loading…</div>;

  const paidTotal = booking.passengers?.filter(p=>p.paymentStatus==='Paid').reduce((s,p)=>s+(p.amount||0),0) || 0;

  return (
    <div className="fu">
      <button className={styles.back} onClick={() => navigate('/bookings')}>← Back</button>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{booking.groupName}</h1>
          <p className={styles.route}>{booking.from} → {booking.to}</p>
        </div>
        <div className={styles.headerRight}>
          <span className={`badge badge-${booking.status.toLowerCase()}`}>{booking.status}</span>
          <button className={styles.seatBtn} onClick={() => navigate(`/seats/${id}`)}>🪑 Seat Map</button>
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.infoItem}><span>Departure</span><strong>{new Date(booking.departure).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</strong></div>
        <div className={styles.infoItem}><span>Arrival</span><strong>{new Date(booking.arrival).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</strong></div>
        <div className={styles.infoItem}><span>Total Fare</span><strong>₹{booking.totalFare?.toLocaleString('en-IN') || '—'}</strong></div>
        <div className={styles.infoItem}><span>Collected</span><strong style={{color:'var(--success)'}}>₹{paidTotal.toLocaleString('en-IN')}</strong></div>
        <div className={styles.infoItem}><span>Passengers</span><strong>{booking.passengers?.length || 0}</strong></div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Passengers</h2>
          <button className={styles.addBtn} onClick={() => setShowAdd(true)}>+ Add Passenger</button>
        </div>

        <div className={styles.table}>
          <div className={styles.thead}>
            <span>Name</span><span>Email</span><span>Seat</span><span>Amount</span><span>Payment</span><span></span>
          </div>
          {booking.passengers?.map(p => (
            <div key={p.id} className={styles.row}>
              <span className={styles.pName}>{p.firstName} {p.lastName}</span>
              <span className={styles.email}>{p.email}</span>
              <span className={styles.seat}>{p.seat || '—'}</span>
              <span>₹{p.amount?.toLocaleString('en-IN') || '—'}</span>
              <span><span className={`badge badge-${p.paymentStatus.toLowerCase()}`}>{p.paymentStatus}</span></span>
              <span><button className={styles.rmBtn} onClick={() => removePassenger(p.id)}>✕</button></span>
            </div>
          ))}
          {!booking.passengers?.length && <div className={styles.empty}>No passengers yet.</div>}
        </div>
      </div>

      {showAdd && (
        <div className={styles.overlay} onClick={() => setShowAdd(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Add Passenger</h2>
            <form onSubmit={addPassenger} className={styles.form}>
              <div className={styles.frow}>
                <input className="form-input" placeholder="First name" value={form.firstName} onChange={set('firstName')} required />
                <input className="form-input" placeholder="Last name"  value={form.lastName}  onChange={set('lastName')}  required />
              </div>
              <input className="form-input" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
              <div className={styles.frow}>
                <input className="form-input" placeholder="Seat (e.g. 12A)" value={form.seat}   onChange={set('seat')} />
                <input className="form-input" type="number" placeholder="Amount (₹)" value={form.amount} onChange={set('amount')} />
              </div>
              <div className={styles.actions}>
                <button type="button" className={styles.cancel} onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className={styles.save} disabled={saving}>
                  {saving ? <span className="spinner"/> : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
