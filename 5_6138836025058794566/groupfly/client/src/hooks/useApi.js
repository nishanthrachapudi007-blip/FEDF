import { useAuth, API } from '../context/AuthContext';

export function useApi() {
  const { token, logout } = useAuth();

  async function apiFetch(path, options = {}) {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    if (res.status === 401) { logout(); throw new Error('Session expired'); }
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    return res.json();
  }

  return { apiFetch };
}
