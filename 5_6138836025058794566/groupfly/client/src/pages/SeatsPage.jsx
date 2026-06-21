import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import styles from './SeatsPage.module.css';

const ROWS = 20;
const COLS = ['A','B','C','D','E','F'];

export default function SeatsPage() {
  const { bookingId } = useParams();
  const { apiFetch } = useApi();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    apiFetch(`/bookings/${bookingId}`).then(setBooking).catch(console.error);
  }, [bookingId]);

  if (!booking) return <div style={{padding:40,color:'var(--muted)'}}>Loading…</div>;

  const taken = {};
  booking.passengers?.forEach(p => { if (p.seat) taken[p.seat] = p; });

  function seatClass(seat) {
    if (taken[seat]) {
      const p = taken[seat];
      if (p.paymentStatus === 'Paid')    return styles.paid;
      if (p.paymentStatus === 'Pending') return styles.pending;
      return styles.failed;
    }
    return styles.free;
  }

  const selectedPax = selected ? taken[selected] : null;

  return (
    <div className="fu">
      <button className={styles.back} onClick={() => navigate(`/bookings/${bookingId}`)}>← Back to Booking</button>
      <h1 className={styles.title}>Seat Map — {booking.groupName}</h1>
      <p className={styles.sub}>{booking.from} → {booking.to}</p>

      <div className={styles.legend}>
        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.paid}`}/>Paid</span>
        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.pending}`}/>Pending</span>
        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.failed}`}/>Failed</span>
        <span className={styles.legendItem}><span className={`${styles.dot} ${styles.free}`}/>Available</span>
      </div>

      <div className={styles.plane}>
        <div className={styles.cockpit}>✈ Front</div>
        <div className={styles.cols}>
          <span/>
          {COLS.slice(0,3).map(c=><span key={c} className={styles.colLabel}>{c}</span>)}
          <span className={styles.aisle}/>
          {COLS.slice(3).map(c=><span key={c} className={styles.colLabel}>{c}</span>)}
        </div>
        {Array.from({length:ROWS},(_,i)=>i+1).map(row=>(
          <div key={row} className={styles.seatRow}>
            <span className={styles.rowNum}>{row}</span>
            {COLS.slice(0,3).map(col => {
              const seat = `${row}${col}`;
              return (
                <button
                  key={seat}
                  className={`${styles.seat} ${seatClass(seat)} ${selected===seat?styles.selectedSeat:''}`}
                  onClick={() => setSelected(selected===seat ? null : seat)}
                  title={taken[seat] ? `${taken[seat].firstName} ${taken[seat].lastName}` : seat}
                >
                  {taken[seat] ? taken[seat].firstName[0] : ''}
                </button>
              );
            })}
            <span className={styles.aisle}/>
            {COLS.slice(3).map(col => {
              const seat = `${row}${col}`;
              return (
                <button
                  key={seat}
                  className={`${styles.seat} ${seatClass(seat)} ${selected===seat?styles.selectedSeat:''}`}
                  onClick={() => setSelected(selected===seat ? null : seat)}
                  title={taken[seat] ? `${taken[seat].firstName} ${taken[seat].lastName}` : seat}
                >
                  {taken[seat] ? taken[seat].firstName[0] : ''}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selectedPax && (
        <div className={styles.paxCard}>
          <strong>{selectedPax.firstName} {selectedPax.lastName}</strong>
          <span>{selectedPax.email}</span>
          <span>Seat <b>{selected}</b></span>
          <span className={`badge badge-${selectedPax.paymentStatus.toLowerCase()}`}>{selectedPax.paymentStatus}</span>
          {selectedPax.amount && <span>₹{selectedPax.amount.toLocaleString('en-IN')}</span>}
        </div>
      )}
    </div>
  );
}
