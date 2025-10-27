import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { CardProvider } from './context/CardContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import ManageCards from './pages/ManageCards';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  // Wrap protected area with CardProvider so cards are available everywhere after login
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <CardProvider>
              <Dashboard />
            </CardProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cards"
        element={
          <ProtectedRoute>
            <CardProvider>
              <ManageCards />
            </CardProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <CardProvider>
              <Profile />
            </CardProvider>
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<div style={{ padding: 40 }}>Not Found</div>} />
    </Routes>
  );
}
