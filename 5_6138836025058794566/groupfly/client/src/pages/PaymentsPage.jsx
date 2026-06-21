import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { useToast } from '../context/ToastContext';
import styles from './PaymentsPage.module.css';

export default function PaymentsPage() {
  const { apiFetch } = useApi();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    const bs = await apiFetch('/bookings');
    const withPax = await Promise.all(bs.map(async b => {
      const d = await apiFetch(`/bookings/${b.id}`);
      return { ...b, passengers: d.passengers || [] };
    }));
    setBookings(withPax);
  };

  useEffect(() => { load().catch(console.error); }, []);

  async function togglePayment(passenger) {
    const next = passenger.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
    setUpdating(passenger.id);
    try {
      await apiFetch(`/passengers/${passenger.id}`, {
        method: 'PUT',
        body: JSON.stringify({ paymentStatus: next }),
      });
      toast('success', `Marked as ${next}`);
      load();
    } catch(err) { toast('error', 'Failed', err.message); }
    finally { setUpdating(null); }
  }

  const allPax = bookings.flatMap(b => b.passengers.map(p => ({ ...p, bookingName: b.groupName })));
  const totalDue = allPax.reduce((s, p) => s + (p.amount || 0), 0);
  const totalPaid = allPax.filter(p => p.paymentStatus === 'Paid').reduce((s, p) => s + (p.amount || 0), 0);
  const pct = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  return (
    <div className="fu">
      <h1 className={styles.title}>Payments</h1>
      <p className={styles.sub}>Track and update payment status per passenger</p>

      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span>Total Due</span>
          <strong>₹{totalDue.toLocaleString('en-IN')}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>Collected</span>
          <strong style={{color:'var(--success)'}}>₹{totalPaid.toLocaleString('en-IN')}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>Pending</span>
          <strong style={{color:'var(--warning)'}}>₹{(totalDue-totalPaid).toLocaleString('en-IN')}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>Collection Rate</span>
          <strong>{pct}%</strong>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{width:`${pct}%`}} />
      </div>

      {bookings.map(b => {
        const paid = b.passengers.filter(p => p.paymentStatus === 'Paid').reduce((s,p)=>s+(p.amount||0),0);
        const total = b.passengers.reduce((s,p)=>s+(p.amount||0),0);
        return (
          <div key={b.id} className={styles.bookingGroup}>
            <div className={styles.groupHeader}>
              <div>
                <span className={styles.groupName}>{b.groupName}</span>
                <span className={styles.groupRoute}> · {b.from}→{b.to}</span>
              </div>
              <span className={styles.groupTotal}>
                ₹{paid.toLocaleString('en-IN')} / ₹{total.toLocaleString('en-IN')}
              </span>
            </div>
            <div className={styles.table}>
              <div className={styles.thead}>
                <span>Passenger</span><span>Seat</span><span>Amount</span><span>Status</span><span>Action</span>
              </div>
              {b.passengers.map(p => (
                <div key={p.id} className={styles.row}>
                  <span className={styles.name}>{p.firstName} {p.lastName}</span>
                  <span className={styles.seat}>{p.seat || '—'}</span>
                  <span>₹{p.amount?.toLocaleString('en-IN') || '—'}</span>
                  <span><span className={`badge badge-${p.paymentStatus.toLowerCase()}`}>{p.paymentStatus}</span></span>
                  <span>
                    <button
                      className={p.paymentStatus==='Paid' ? styles.unpayBtn : styles.payBtn}
                      onClick={() => togglePayment(p)}
                      disabled={updating === p.id}
                    >
                      {updating===p.id ? <span className="spinner"/> : p.paymentStatus==='Paid' ? 'Mark Pending' : 'Mark Paid'}
                    </button>
                  </span>
                </div>
              ))}
              {!b.passengers.length && <div className={styles.empty}>No passengers.</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
