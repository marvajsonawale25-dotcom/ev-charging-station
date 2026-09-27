import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, LogIn, AlertCircle, User, Briefcase, Shield } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (role) => {
    if (role === 'ROLE_CUSTOMER') return '/customer/dashboard';
    if (role === 'ROLE_OPERATOR') return '/operator/dashboard';
    if (role === 'ROLE_ADMIN') return '/admin/dashboard';
    return '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(email, password);
      const from = location.state?.from?.pathname || redirectPath(user.role);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setSubmitting(true);
    try {
      const user = await login(demoEmail, demoPassword);
      navigate(redirectPath(user.role), { replace: true });
    } catch (err) {
      setError('Demo login failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="ev-card p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="brand-badge mx-auto mb-2">
                  <Zap size={24} />
                </div>
                <h3 className="fw-bold text-dark">Welcome Back</h3>
                <p className="text-muted small">Sign in to manage bookings, track charging, and view bills.</p>
              </div>

              {/* Demo 1-Click Credentials Banner */}
              <div className="p-3 mb-4 rounded-3 bg-light border">
                <div className="small fw-bold text-dark mb-2">⚡ Quick 1-Click Demo Accounts (Viva Testing):</div>
                <div className="d-grid gap-2">
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-success text-start d-flex justify-content-between align-items-center"
                    onClick={() => handleQuickLogin('customer@evhub.in', 'Customer@123')}
                    disabled={submitting}
                  >
                    <span><User size={14} className="me-1" /> Customer (Rahul Sharma)</span>
                    <span className="badge bg-success">EV Driver</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-primary text-start d-flex justify-content-between align-items-center"
                    onClick={() => handleQuickLogin('operator@evhub.in', 'Operator@123')}
                    disabled={submitting}
                  >
                    <span><Briefcase size={14} className="me-1" /> Station Operator (Mumbai Infra)</span>
                    <span className="badge bg-primary">Operator</span>
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-danger text-start d-flex justify-content-between align-items-center"
                    onClick={() => handleQuickLogin('admin@evhub.in', 'Admin@123')}
                    disabled={submitting}
                  >
                    <span><Shield size={14} className="me-1" /> Admin (System Controller)</span>
                    <span className="badge bg-danger">Admin</span>
                  </button>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between">
                    <label className="form-label small fw-semibold text-muted">Password</label>
                  </div>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-emerald w-100 justify-content-center py-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  ) : (
                    <LogIn size={18} />
                  )}
                  {submitting ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              <div className="text-center mt-4 pt-3 border-top small text-muted">
                Don't have an account? <Link to="/register" className="text-success fw-bold text-decoration-none">Register here</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
