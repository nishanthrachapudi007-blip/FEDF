import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './HomePage.module.css';

export default function HomePage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ firstName:'', lastName:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await signup(form.firstName, form.lastName, form.email, form.password);
      }
      toast('success', 'Welcome to GroupFly!');
      navigate('/dashboard');
    } catch (err) {
      toast('error', 'Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.logoMark}>✈</div>
        <h1 className={styles.brand}>GroupFly</h1>
        <p className={styles.tagline}>Group Booking Management, Simplified</p>
        <div className={styles.features}>
          {['Manage group bookings', 'Assign seats', 'Split payments'].map(f => (
            <span key={f} className={styles.feature}>✓ {f}</span>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tabs}>
          <button className={mode==='login'?styles.tabActive:styles.tab} onClick={()=>setMode('login')}>Sign In</button>
          <button className={mode==='signup'?styles.tabActive:styles.tab} onClick={()=>setMode('signup')}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'signup' && (
            <div className={styles.row}>
              <input className="form-input" placeholder="First name" value={form.firstName} onChange={set('firstName')} required />
              <input className="form-input" placeholder="Last name"  value={form.lastName}  onChange={set('lastName')}  required />
            </div>
          )}
          <input className="form-input" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
          <input className="form-input" type="password" placeholder="Password" value={form.password} onChange={set('password')} required />

          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? <span className="spinner"/> : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className={styles.hint}>
          Demo: <strong>ravi@example.com</strong> / <strong>password123</strong>
        </p>
      </div>
    </div>
  );
}
