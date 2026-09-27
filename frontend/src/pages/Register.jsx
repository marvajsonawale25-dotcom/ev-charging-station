import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, User, Phone, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'ROLE_CUSTOMER',
    stationName: '',
    stationAddress: '',
    stationCity: 'Mumbai',
    stationPincode: '400001',
    operatingHours: '24 / 7 Accessible',
    amenities: 'WiFi, EV Parking, Cafe'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.role === 'ROLE_OPERATOR' && !formData.stationName.trim()) {
      setError('Charging Station Name is required for operators.');
      setLoading(false);
      return;
    }

    try {
      const extra = formData.role === 'ROLE_OPERATOR' ? {
        stationName: formData.stationName,
        stationAddress: formData.stationAddress || 'Main Highway Hub',
        stationCity: formData.stationCity || 'Mumbai',
        stationPincode: formData.stationPincode || '400001',
        operatingHours: formData.operatingHours || '24 / 7 Accessible',
        amenities: formData.amenities || 'WiFi, EV Parking, Cafe',
        latitude: 19.0760,
        longitude: 72.8777
      } : {};

      const user = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone,
        formData.role,
        extra
      );

      if (user.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'ROLE_OPERATOR') {
        navigate('/operator/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card card-custom p-4 p-md-5">
            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3"
                style={{ width: '64px', height: '64px' }}
              >
                <Zap size={32} />
              </div>
              <h3 className="fw-bold mb-1">Create an Account</h3>
              <p className="text-muted small">
                Join VoltPoint to discover, book, and charge at top EV stations across the city
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-4" role="alert">
                <AlertCircle size={18} className="flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Role Selection */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Registering As</label>
                <div className="row g-2">
                  <div className="col-6">
                    <label
                      className={`w-100 p-2 border rounded-3 text-center cursor-pointer transition-all ${
                        formData.role === 'ROLE_CUSTOMER'
                          ? 'border-primary bg-primary bg-opacity-10 text-primary fw-bold'
                          : 'border-secondary text-muted'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="ROLE_CUSTOMER"
                        checked={formData.role === 'ROLE_CUSTOMER'}
                        onChange={handleChange}
                        className="d-none"
                      />
                      <User size={18} className="me-1 mb-1" />
                      <div>EV Driver</div>
                    </label>
                  </div>
                  <div className="col-6">
                    <label
                      className={`w-100 p-2 border rounded-3 text-center cursor-pointer transition-all ${
                        formData.role === 'ROLE_OPERATOR'
                          ? 'border-primary bg-primary bg-opacity-10 text-primary fw-bold'
                          : 'border-secondary text-muted'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="ROLE_OPERATOR"
                        checked={formData.role === 'ROLE_OPERATOR'}
                        onChange={handleChange}
                        className="d-none"
                      />
                      <ShieldCheck size={18} className="me-1 mb-1" />
                      <div>Station Operator</div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Operator / Full Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">
                  {formData.role === 'ROLE_OPERATOR' ? 'Operator / Company / Owner Name' : 'Full Name'}
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-muted">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-control form-control-custom"
                    placeholder={formData.role === 'ROLE_OPERATOR' ? 'e.g. Pune Infra Power Ltd' : 'e.g. Jaydeep Patil'}
                    required
                  />
                </div>
              </div>

              {/* Station Details Section (Only for Operators) */}
              {formData.role === 'ROLE_OPERATOR' && (
                <div className="p-3 mb-3 border border-primary border-opacity-25 rounded-3 bg-primary bg-opacity-10">
                  <div className="fw-semibold text-primary small mb-2 d-flex align-items-center gap-1">
                    <Zap size={16} /> Charging Station Onboarding
                  </div>

                  <div className="mb-2">
                    <label className="form-label extra-small text-muted mb-1">Charging Station Name *</label>
                    <input
                      type="text"
                      name="stationName"
                      value={formData.stationName}
                      onChange={handleChange}
                      className="form-control form-control-custom form-control-sm"
                      placeholder="e.g. Shivaji Nagar EV Supercharge Hub"
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label extra-small text-muted mb-1">Station Address *</label>
                    <input
                      type="text"
                      name="stationAddress"
                      value={formData.stationAddress}
                      onChange={handleChange}
                      className="form-control form-control-custom form-control-sm"
                      placeholder="e.g. Opp. Metro Station, FC Road"
                      required
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label extra-small text-muted mb-1">City</label>
                      <select
                        name="stationCity"
                        value={formData.stationCity}
                        onChange={handleChange}
                        className="form-select form-control-custom form-control-sm"
                      >
                        <option value="Mumbai">Mumbai</option>
                        <option value="Navi Mumbai">Navi Mumbai</option>
                        <option value="Thane">Thane</option>
                        <option value="Pune">Pune</option>
                        <option value="Nashik">Nashik</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label extra-small text-muted mb-1">Pincode</label>
                      <input
                        type="text"
                        name="stationPincode"
                        value={formData.stationPincode}
                        onChange={handleChange}
                        className="form-control form-control-custom form-control-sm"
                        placeholder="e.g. 411005"
                      />
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label extra-small text-muted mb-1">Operating Hours</label>
                      <input
                        type="text"
                        name="operatingHours"
                        value={formData.operatingHours}
                        onChange={handleChange}
                        className="form-control form-control-custom form-control-sm"
                        placeholder="24 / 7 Accessible"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label extra-small text-muted mb-1">Amenities</label>
                      <input
                        type="text"
                        name="amenities"
                        value={formData.amenities}
                        onChange={handleChange}
                        className="form-control form-control-custom form-control-sm"
                        placeholder="WiFi, EV Parking, Cafe"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-muted">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control form-control-custom"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Contact / Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-muted">
                    <Phone size={18} />
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="form-control form-control-custom"
                    placeholder="e.g. 9876543210"
                    pattern="[0-9]{10}"
                    title="Please enter a 10-digit phone number"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-muted">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-control form-control-custom"
                    placeholder="Min 6 characters"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Complete Registration <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer link */}
            <div className="text-center mt-4 pt-2 border-top border-secondary">
              <span className="text-muted small">Already have an account? </span>
              <Link to="/login" className="text-primary text-decoration-none small fw-semibold">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
