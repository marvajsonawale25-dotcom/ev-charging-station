import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, BatteryCharging, DollarSign, Leaf, Calendar, 
  Car, Clock, ArrowRight, CheckCircle, AlertCircle, PlayCircle, XCircle 
} from 'lucide-react';
import ChargerBadge from '../components/ChargerBadge';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const fetchDashboard = async () => {
  setLoading(true);
  setError('');

  try {
    const [dashboardRes, vehiclesRes] = await Promise.all([
      api.get('/dashboard/customer'),
      api.get('/vehicles/my')
    ]);

    setDashboardData(dashboardRes.data);
    setVehicles(vehiclesRes.data || []);
  } catch (err) {
    console.error('Dashboard loading error:', err);
    setError('Unable to load dashboard data. Please try again.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleStartCharging = async (bookingId) => {
    try {
      const res = await api.post('/sessions/start', {
        bookingId,
        initialBatteryPercentage: 20
      });
      navigate(`/charging/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not start charging session');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted">Loading your EV dashboard...</p>
      </div>
    );
  }

  const {
  upcomingBookings = [],
  activeSessions = [],
  completedSessions = 0,
  totalKwhCharged = 0,
  totalAmountSpent = 0,
  co2SavedKg = 0
} = dashboardData || {};

  const activeSession = activeSessions.length > 0 ? activeSessions[0] : null;

  return (
    <div className="container py-4">
      {/* Welcome & Quick Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Welcome back, <span className="text-primary">{user?.name}</span>
          </h2>
          <p className="text-muted small mb-0">
            Monitor your charging sessions, manage reserved slots, and track your green footprint
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/stations" className="btn btn-primary btn-custom d-flex align-items-center gap-2">
            <Zap size={16} /> Find Station
          </Link>
          <Link to="/vehicles" className="btn btn-dark border-secondary btn-custom d-flex align-items-center gap-2">
            <Car size={16} /> My Garage
          </Link>
        </div>
      </div>

      {/* Active Live Session Alert Banner */}
      {activeSession && (
        <div className="card card-custom p-4 mb-4 border border-primary bg-primary bg-opacity-10">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-3 bg-primary text-white rounded-circle">
                <BatteryCharging size={28} className="spin" />
              </div>
              <div>
                <div className="badge bg-primary mb-1">⚡ LIVE SESSION IN PROGRESS</div>
                <h5 className="fw-bold mb -1 text-white">
                  {activeSession.charger?.station?.name || 'Charging Station'} - Port {activeSession.charger?.identifier}
                </h5>
                <p className="text-muted small mb-0">
                  Current Battery: <strong className="text-light">{activeSession.currentBatteryPercentage}%</strong> | 
                  Delivered: <strong className="text-light">{activeSession.energyDeliveredKwh} kWh</strong> | 
                  Cost: <strong className="text-light">₹{activeSession.currentCost}</strong>
                </p>
              </div>
            </div>
            <Link
              to={`/charging/${activeSession.id}`}
              className="btn btn-primary btn-custom d-flex align-items-center gap-2"
            >
              Open Live Charging Hub <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card card-custom p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Energy Delivered</span>
              <div className="p-2 bg-primary bg-opacity-10 text-primary rounded-3">
                <Zap size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-white mb-1">{totalKwhCharged.toFixed(1)} <span className="fs-6 fw-normal text-muted">kWh</span></div>
            <span className="text-success extra-small fw-semibold">Across all sessions</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card card-custom p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Total Spent</span>
              <div className="p-2 bg-success bg-opacity-10 text-success rounded-3">
                <DollarSign size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-white mb-1">₹{totalAmountSpent.toFixed(0)}</div>
            <span className="text-muted extra-small">Including 18% GST</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card card-custom p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">Completed Sessions</span>
              <div className="p-2 bg-info bg-opacity-10 text-info rounded-3">
                <BatteryCharging size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-white mb-1">{completedSessions}</div>
            <span className="text-muted extra-small">Total successful charges</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card card-custom p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small">CO₂ Offset</span>
              <div className="p-2 bg-success bg-opacity-10 text-success rounded-3">
                <Leaf size={18} />
              </div>
            </div>
            <div className="fs-3 fw-bold text-success mb-1">{co2SavedKg.toFixed(1)} <span className="fs-6 fw-normal text-muted">kg</span></div>
            <span className="text-success extra-small fw-semibold">🌱 Green Impact</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Bookings & Registered Vehicles */}
      <div className="row g-4">
        {/* Left: Upcoming Bookings */}
        <div className="col-12 col-lg-8">
          <div className="card card-custom p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <Calendar size={20} className="text-primary" />
                Upcoming Bookings
              </h5>
              <Link to="/bookings" className="text-primary text-decoration-none small">
                View All
              </Link>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted small mb-3">No upcoming slot reservations found.</p>
                <Link to="/stations" className="btn btn-primary btn-sm btn-custom">
                  Browse Stations & Book a Slot
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {upcomingBookings.map((b) => (
                  <div key={b.id} className="p-3 bg-dark rounded-3 border border-secondary">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-success bg-opacity-15 text-success">
                            {b.status}
                          </span>
                          <span className="text-muted extra-small">Booking #{b.id}</span>
                        </div>
                        <h6 className="fw-bold text-white mb-1">
                          {b.station?.name || b.charger?.station?.name || 'EV Station'}
                        </h6>
                        <div className="text-muted small d-flex flex-wrap gap-3">
                          <span className="d-flex align-items-center gap-1">
                            <Clock size={14} />
                            {new Date(b.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                          <span>
                            Port:{' '}
                            {b.charger ? (
                              <><strong className="text-light">{b.charger.identifier}</strong> ({b.charger.chargerType})</>
                            ) : (
                              <span className="text-warning fst-italic">Auto-assigned before start</span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success btn-sm btn-custom d-flex align-items-center gap-1"
                          onClick={() => handleStartCharging(b.id)}
                          disabled={!b.charger}
                          title={!b.charger ? 'A port will be assigned shortly before your reservation begins' : ''}
                        >
                          <PlayCircle size={16} /> Start Charge
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleCancelBooking(b.id)}
                          disabled={cancellingId === b.id}
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: My Garage Quick Widget */}
        <div className="col-12 col-lg-4">
          <div className="card card-custom p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                <Car size={20} className="text-primary" />
                My Garage
              </h5>
              <Link to="/vehicles" className="text-primary text-decoration-none small">
                + Add
              </Link>
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted small mb-3">No electric vehicle added yet.</p>
                <Link to="/vehicles" className="btn btn-outline-secondary btn-sm">
                  Register Your EV
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {vehicles.map((v) => (
                  <div key={v.id} className="p-3 bg-dark rounded-3 border border-secondary">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-bold text-white small">
  {v.modelName || 'EV Vehicle'}
</div>
<span className="badge bg-secondary extra-small">
  {v.registrationNumber || v.vehicleNumber || 'No registration number'}
</span>
                      </div>
                      <span className="badge bg-primary bg-opacity-15 text-primary">
                        {v.batteryCapacityKwh} kWh
                      </span>
                    </div>
                    <div className="text-muted extra-small mt-2">
                      Port: <span className="text-light">{v.connectorType}</span> | Max: <span className="text-light">{v.maxChargingPowerKw} kW</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
