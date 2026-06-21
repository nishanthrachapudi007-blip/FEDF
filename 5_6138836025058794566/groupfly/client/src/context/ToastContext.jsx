import { createContext, useContext, useState, useCallback } from 'react';
import styles from './Toast.module.css';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((type, title, body) => {
    const id = Date.now();
    setToasts(t => [...t, { id, type, title, body }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800);
  }, []);

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className={styles.container}>
        {toasts.map(t => (
          <div key={t.id} className={styles.toast}>
            <span className={styles.icon}>{icons[t.type] || 'ℹ️'}</span>
            <div>
              <div className={styles.title}>{t.title}</div>
              {t.body && <div className={styles.body}>{t.body}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() { return useContext(ToastCtx); }
