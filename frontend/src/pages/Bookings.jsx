import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Calendar, Clock, MapPin, BatteryCharging, PlayCircle, 
  XCircle, CheckCircle, AlertCircle, ArrowRight, RefreshCw 
} from 'lucide-react';
import ChargerBadge from '../components/ChargerBadge';

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('UPCOMING'); // UPCOMING, ALL
  const [actionLoading, setActionLoading] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data);
    } catch (err) {
      setError('Failed to fetch your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStartSession = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      const res = await api.post('/sessions/start', {
        bookingId,
        initialBatteryPercentage: 20
      });
      navigate(`/charging/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate charging session');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setActionLoading(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') {
      return b.status === 'CONFIRMED' || b.status === 'PENDING';
    }
    return true;
  });

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Calendar className="text-primary" size={28} />
            My Slot Reservations
          </h2>
          <p className="text-muted small mb-0">
            View scheduled time slots, trigger live charging, or manage your bookings
          </p>
        </div>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-dark border-secondary btn-sm d-flex align-items-center gap-2"
            onClick={fetchBookings}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <Link to="/stations" className="btn btn-primary btn-sm btn-custom">
            + Book New Slot
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom border-secondary pb-2">
        <button
          className={`btn btn-sm ${
            activeTab === 'UPCOMING' ? 'btn-primary' : 'btn-dark border-secondary text-muted'
          }`}
          onClick={() => setActiveTab('UPCOMING')}
        >
          Upcoming & Active ({bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length})
        </button>
        <button
          className={`btn btn-sm ${
            activeTab === 'ALL' ? 'btn-primary' : 'btn-dark border-secondary text-muted'
          }`}
          onClick={() => setActiveTab('ALL')}
        >
          All History ({bookings.length})
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <p className="text-muted small">Loading reservations...</p>
        </div>
      )}

      {!loading && filteredBookings.length === 0 && (
        <div className="card card-custom p-5 text-center">
          <Calendar size={40} className="text-muted mx-auto mb-3" />
          <h5 className="fw-bold mb-1">No reservations in this category</h5>
          <p className="text-muted small mb-3">
            You don't have any upcoming reservations. Reserve your spot at any station in seconds.
          </p>
          <div>
            <Link to="/stations" className="btn btn-primary btn-custom">
              Explore Stations
            </Link>
          </div>
        </div>
      )}

      {!loading && filteredBookings.length > 0 && (
        <div className="row g-3">
          {filteredBookings.map((b) => {
            const isConfirmed = b.status === 'CONFIRMED';
            const isCompleted = b.status === 'COMPLETED';
            const isCancelled = b.status === 'CANCELLED';

            return (
              <div key={b.id} className="col-12">
                <div className="card card-custom p-4">
                  <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                    {/* Left: Info */}
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className={`badge ${
                          isConfirmed ? 'bg-success bg-opacity-15 text-success' :
                          isCompleted ? 'bg-info bg-opacity-15 text-info' :
                          'bg-danger bg-opacity-15 text-danger'
                        }`}>
                          ● {b.status}
                        </span>
                        <span className="text-muted small">Reservation #{b.id}</span>
                      </div>

                      <h5 className="fw-bold text-white mb-1">
                        {b.station?.name || b.charger?.station?.name || 'EV Charging Hub'}
                      </h5>
                      <p className="text-muted small mb-2 d-flex align-items-center gap-1">
                        <MapPin size={14} className="text-primary" />
                        {b.station?.address || b.charger?.station?.address}, {b.station?.city || b.charger?.station?.city}
                      </p>

                      <div className="d-flex flex-wrap gap-4 text-muted small mt-3">
                        <div>
                          <span className="text-muted d-block extra-small">Time Window</span>
                          <span className="text-light fw-medium d-flex align-items-center gap-1">
                            <Clock size={14} className="text-primary" />
                            {new Date(b.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            {' → '}
                            {new Date(b.endTime).toLocaleTimeString([], { timeStyle: 'short' })}
                          </span>
                        </div>

                        <div>
                          <span className="text-muted d-block extra-small">Charger Port</span>
                          <span className="text-light fw-medium">
                            {b.charger ? (
                              `${b.charger.identifier} (${b.charger.powerKw || b.charger.powerRatingKw || 50} kW ${b.charger.chargerType})`
                            ) : (
                              <span className="text-warning fst-italic">Port will be assigned shortly before your booking.</span>
                            )}
                          </span>
                        </div>

                        <div>
                          <span className="text-muted d-block extra-small">Vehicle</span>
                          <span className="text-light fw-medium">
                            {b.vehicle ? `${b.vehicle.modelName || `${b.vehicle.make || ''} ${b.vehicle.model || ''}`} (${b.vehicle.registrationNumber})` : 'Registered EV'}
                          </span>
                        </div>

                        <div>
                          <span className="text-muted d-block extra-small">Estimated Cost</span>
                          <span className="text-primary fw-bold">
                            ₹{b.estimatedCost || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="d-flex flex-row flex-lg-column justify-content-end align-items-end gap-2 border-top border-lg-0 pt-3 pt-lg-0 border-secondary">
                      {isConfirmed && (
                        <>
                          <button
                            className="btn btn-success btn-custom d-flex align-items-center gap-2"
                            onClick={() => handleStartSession(b.id)}
                            disabled={actionLoading === b.id || !b.charger}
                            title={!b.charger ? 'A compatible port will be automatically assigned shortly before your reservation.' : ''}
                          >
                            <PlayCircle size={18} />
                            {actionLoading === b.id ? 'Starting...' : 'Start Charging Now'}
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleCancelBooking(b.id)}
                            disabled={actionLoading === b.id}
                          >
                            <XCircle size={14} className="me-1" /> Cancel Reservation
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <Link to="/history" className="btn btn-outline-primary btn-sm">
                          View Invoice
                        </Link>
                      )}

                      {isCancelled && (
                        <span className="text-muted small">Cancelled</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookings;
