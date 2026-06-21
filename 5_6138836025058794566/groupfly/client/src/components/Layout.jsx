import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import styles from './Layout.module.css';

const nav = [
  { to: '/dashboard',  icon: '⬡', label: 'Dashboard'  },
  { to: '/bookings',   icon: '✈', label: 'Bookings'   },
  { to: '/passengers', icon: '👥', label: 'Passengers' },
  { to: '/payments',   icon: '💳', label: 'Payments'   },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast('info', 'Signed out', 'See you next time!');
    navigate('/');
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>✈</div>
          <span className={styles.logoText}>GroupFly</span>
        </div>

        <nav className={styles.nav}>
          {nav.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{n.icon}</span>
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.userCard}>
          <div className={styles.avatar}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.firstName} {user?.lastName}</div>
            <div className={styles.userEmail}>{user?.email}</div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Sign out">↩</button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
