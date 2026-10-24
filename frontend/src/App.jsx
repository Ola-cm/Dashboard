import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Confirm from './pages/Confirm';
import SharedDashboard from './pages/SharedDashboard';
import Legal from './pages/Legal';
import Services from './pages/Services';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Theme from './pages/Theme';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/confirm/:token" element={<Confirm />} />
      <Route path="/shared/:token" element={<SharedDashboard />} />
      <Route path="/legal" element={<Legal />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        }
      />
      <Route
        path="/theme"
        element={
          <ProtectedRoute>
            <Theme />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />
    </Routes>
  );
}
