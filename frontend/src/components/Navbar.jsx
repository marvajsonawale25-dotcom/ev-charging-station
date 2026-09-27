import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, MapPin, Calendar, Activity, Receipt, Car, LayoutDashboard, Shield, LogOut, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, isCustomer, isOperator, isAdmin, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickDemo = async (roleType) => {
    if (roleType === 'customer') {
      await login('customer@evhub.in', 'Customer@123');
      navigate('/customer/dashboard');
    } else if (roleType === 'operator') {
      await login('operator@evhub.in', 'Operator@123');
      navigate('/operator/dashboard');
    } else if (roleType === 'admin') {
      await login('admin@evhub.in', 'Admin@123');
      navigate('/admin/dashboard');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg app-navbar py-2 px-3">
      <div className="container-fluid">
        {/* Brand */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none">
          <div className="brand-badge">
            <Zap size={22} />
          </div>
          <div>
            <span className="brand-text">VoltPoint EV</span>
            <span className="badge bg-light text-dark border ms-2 small d-none d-sm-inline" style={{ fontSize: '0.7rem' }}>Mini Project</span>
          </div>
        </Link>

        {/* Mobile toggler */}
        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar links */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
            <li className="nav-item">
              <Link to="/stations" className={`nav-link-custom ${isActive('/stations') ? 'active' : ''}`}>
                <MapPin size={16} /> Discover Stations
              </Link>
            </li>

            {/* Customer Links */}
            {isAuthenticated && isCustomer && (
              <>
                <li className="nav-item">
                  <Link to="/customer/dashboard" className={`nav-link-custom ${isActive('/customer/dashboard') ? 'active' : ''}`}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/customer/bookings" className={`nav-link-custom ${isActive('/customer/bookings') ? 'active' : ''}`}>
                    <Calendar size={16} /> My Bookings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/customer/charging" className={`nav-link-custom ${isActive('/customer/charging') ? 'active' : ''}`}>
                    <Activity size={16} /> Live Charging
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/customer/history" className={`nav-link-custom ${isActive('/customer/history') ? 'active' : ''}`}>
                    <Receipt size={16} /> Receipts & History
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/customer/vehicles" className={`nav-link-custom ${isActive('/customer/vehicles') ? 'active' : ''}`}>
                    <Car size={16} /> My EVs
                  </Link>
                </li>
              </>
            )}

            {/* Operator Links */}
            {isAuthenticated && isOperator && (
              <>
                <li className="nav-item">
                  <Link to="/operator/dashboard" className={`nav-link-custom ${isActive('/operator/dashboard') ? 'active' : ''}`}>
                    <LayoutDashboard size={16} /> Operator Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/operator/stations" className={`nav-link-custom ${isActive('/operator/stations') ? 'active' : ''}`}>
                    <Zap size={16} /> Manage Stations
                  </Link>
                </li>
              </>
            )}

            {/* Admin Links */}
            {isAuthenticated && isAdmin && (
              <>
                <li className="nav-item">
                  <Link to="/admin/dashboard" className={`nav-link-custom ${isActive('/admin/dashboard') ? 'active' : ''}`}>
                    <Shield size={16} /> Admin Console
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Right Action Buttons & Auth */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {/* Quick Demo Switcher Dropdown for Viva / Mentors */}
            <div className="dropdown">
              <button 
                className="btn btn-sm btn-outline-secondary dropdown-toggle d-flex align-items-center gap-1 rounded-3 py-1 px-2"
                type="button" 
                data-bs-toggle="dropdown"
              >
                <span className="badge bg-dark text-white me-1">Demo Role</span>
                Switch
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                <li><h6 className="dropdown-header">Quick Role Switch (1-Click)</h6></li>
                <li>
                  <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleQuickDemo('customer')}>
                    <span className="badge bg-success">Customer</span> Rahul Sharma (Nexon EV)
                  </button>
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleQuickDemo('operator')}>
                    <span className="badge bg-primary">Operator</span> Mumbai Charging Networks
                  </button>
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center gap-2" onClick={() => handleQuickDemo('admin')}>
                    <span className="badge bg-danger">Admin</span> System Administrator
                  </button>
                </li>
              </ul>
            </div>

            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2 ms-2">
                <div className="text-end d-none d-md-block">
                  <div className="fw-bold small text-dark">{user?.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {isCustomer ? 'EV Driver' : isOperator ? 'Station Operator' : 'Administrator'}
                  </div>
                </div>
                <button onClick={handleLogout} className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 rounded-3 py-1">
                  <LogOut size={15} /> Logout
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-sm btn-outline-dark d-flex align-items-center gap-1 rounded-3 px-3 py-1">
                  <LogIn size={15} /> Login
                </Link>
                <Link to="/register" className="btn-emerald text-decoration-none btn-sm py-1 px-3">
                  <UserPlus size={15} /> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
