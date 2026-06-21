import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import BookingsPage from './pages/BookingsPage';
import BookingDetail from './pages/BookingDetail';
import PassengersPage from './pages/PassengersPage';
import SeatsPage from './pages/SeatsPage';
import PaymentsPage from './pages/PaymentsPage';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <HomePage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="bookings"   element={<BookingsPage />} />
        <Route path="bookings/:id" element={<BookingDetail />} />
        <Route path="passengers" element={<PassengersPage />} />
        <Route path="seats/:bookingId" element={<SeatsPage />} />
        <Route path="payments"   element={<PaymentsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
