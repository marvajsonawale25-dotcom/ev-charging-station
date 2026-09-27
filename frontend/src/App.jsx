import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Stations from './pages/Stations';
import StationDetail from './pages/StationDetail';
import CustomerDashboard from './pages/CustomerDashboard';
import Bookings from './pages/Bookings';
import LiveCharging from './pages/LiveCharging';
import Billing from './pages/Billing';
import History from './pages/History';
import Vehicles from './pages/Vehicles';
import OperatorDashboard from './pages/OperatorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="d-flex flex-column min-vh-100 bg-black text-light">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/stations" element={<Stations />} />
              <Route path="/stations/:id" element={<StationDetail />} />

              {/* Customer Protected Routes (Supports both direct and /customer/* prefixes) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN', 'ROLE_OPERATOR']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN', 'ROLE_OPERATOR']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bookings"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <Bookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/bookings"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <Bookings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/charging"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <LiveCharging />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/charging"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <LiveCharging />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/charging/:id"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <LiveCharging />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/charging/:id"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <LiveCharging />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/billing"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <Billing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/billing/:id"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <Billing />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/history"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/history"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <History />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/vehicles"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <Vehicles />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/vehicles"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                    <Vehicles />
                  </ProtectedRoute>
                }
              />

              {/* Operator Protected Routes */}
              <Route
                path="/operator"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_OPERATOR', 'ROLE_ADMIN']}>
                    <OperatorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/operator/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_OPERATOR', 'ROLE_ADMIN']}>
                    <OperatorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
