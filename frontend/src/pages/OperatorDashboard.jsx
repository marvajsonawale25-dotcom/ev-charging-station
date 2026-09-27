import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, Zap, BatteryCharging, DollarSign, Calendar, 
  Settings, Plus, RefreshCw, AlertCircle, CheckCircle, Wrench, Power, Star
} from 'lucide-react';
import ChargerBadge from '../components/ChargerBadge';

const OperatorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  // Add Charger modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newCharger, setNewCharger] = useState({
    identifier: '',
    chargerType: 'DC_FAST',
    connectorType: 'CCS2',
    powerRatingKw: 60.0,
    pricePerKwh: 18.0
  });

  const fetchOperatorDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, revRes] = await Promise.all([
        api.get('/dashboard/operator'),
        api.get('/reviews/operator').catch(() => ({ data: [] }))
      ]);

      setDashboardData(dashRes.data);
      setReviews(revRes.data || []);
    } catch (err) {
      console.error('OPERATOR DASHBOARD ERROR:', err);
      alert(err.response?.data?.message || 'Failed to load operator dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperatorDashboard();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? The assigned charger will immediately become available for other customers.')) return;
    setCancellingBookingId(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      fetchOperatorDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const handleUpdateChargerStatus = async (chargerId, newStatus) => {
    setStatusUpdating(chargerId);
    try {
      await api.put(`/chargers/${chargerId}/status`, null, {
        params: { status: newStatus }
      });
      fetchOperatorDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update charger status');
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleAddCharger = async (e) => {
    e.preventDefault();
    if (!station?.id) {
  alert('Station information is not available.');
  return;
}
    setAddLoading(true);
    try {
      await api.post('/chargers', {
        ...newCharger,
        stationId: station.id,
        status: 'AVAILABLE'
      });
      setShowAddModal(false);
      setNewCharger({
        identifier: '',
        chargerType: 'DC_FAST',
        connectorType: 'CCS2',
         powerRatingKw: 60.0,
        pricePerKwh: 18.0
      });
      fetchOperatorDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add charger port');
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-2"></div>
        <p className="text-muted small">Loading operator station console...</p>
      </div>
    );
  }

  const {
    station,
    chargers = [],
    todaysBookings = [],
    activeSessions = [],
    totalRevenueToday = 0,
    totalKwhDeliveredToday = 0
  } = dashboardData || {};

  return (
    <div className="container py-4">
      {/* Top Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-warning bg-opacity-15 text-warning">
              ● OPERATOR PORTAL
            </span>
            <span className="text-muted small">Station Operator: {user?.name}</span>
          </div>
          <h2 className="fw-bold mb-1 text-white">
            {station ? station.name : 'Station Management Console'}
          </h2>
          <p className="text-muted small mb-0">
            {station ? `${station.address}, ${station.city} (${station.operatingHours})` : 'Managing network assets'}
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-dark border-secondary btn-sm d-flex align-items-center gap-2"
            onClick={fetchOperatorDashboard}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <button
  className="btn btn-primary btn-sm btn-custom d-flex align-items-center gap-2"
  onClick={() => setShowAddModal(true)}
>
  <Plus size={16} /> Add Charger Port
</button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card card-custom p-3 h-100">
            <span className="text-muted small">Total Ports</span>
            <div className="fs-3 fw-bold text-white my-1">{chargers.length}</div>
            <span className="text-success extra-small">
              {chargers.filter(c => c.status === 'AVAILABLE').length} Available now
            </span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card card-custom p-3 h-100">
            <span className="text-muted small">Today's Revenue</span>
            <div className="fs-3 fw-bold text-white my-1">₹{totalRevenueToday.toFixed(0)}</div>
            <span className="text-muted extra-small">Settled invoices</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card card-custom p-3 h-100">
            <span className="text-muted small">Today's Energy</span>
            <div className="fs-3 fw-bold text-white my-1">{totalKwhDeliveredToday.toFixed(1)} kWh</div>
            <span className="text-primary extra-small">Dispatched to EVs</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card card-custom p-3 h-100">
            <span className="text-muted small">Active Sessions</span>
            <div className="fs-3 fw-bold text-primary my-1">{activeSessions.length}</div>
            <span className="text-muted extra-small">Currently plugged in</span>
          </div>
        </div>
      </div>

      {/* Charger Hardware Grid */}
      <div className="card card-custom p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Zap size={20} className="text-primary" />
            Station Charger Hardware Control
          </h5>
          <span className="text-muted small">Instant hardware status overrides</span>
        </div>

        <div className="row g-3">
          {chargers.map((c) => {
            const isAvail = c.status === 'AVAILABLE';
            const isMaint = c.status === 'MAINTENANCE';
            const isOcc = c.status === 'OCCUPIED';

            return (
              <div key={c.id} className="col-12 col-md-6 col-lg-4">
                <div className="p-3 rounded-3 bg-dark border border-secondary h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="fw-bold text-white fs-6">{c.identifier}</span>
                      <ChargerBadge charger={c} />
                    </div>

                    <div className="small text-muted mb-3">
                      <div>Type: <strong className="text-light">{c.chargerType}</strong></div>
                      <div>Connector: <strong className="text-light">{c.connectorType}</strong></div>
                      <div>Output: <strong className="text-light">{c.powerRatingKw} kW</strong></div>
                      <div>Rate: <strong className="text-light">₹{c.pricePerKwh}/kWh</strong></div>
                    </div>
                  </div>

                  {/* Hardware Status Toggle Buttons */}
                  <div className="pt-2 border-top border-secondary">
                    <span className="text-muted extra-small d-block mb-1">Override Status:</span>
                    <div className="d-flex gap-1">
                      <button
                        className={`btn btn-sm flex-grow-1 extra-small py-1 ${
                          isAvail ? 'btn-success' : 'btn-outline-secondary'
                        }`}
                        onClick={() => handleUpdateChargerStatus(c.id, 'AVAILABLE')}
                        disabled={statusUpdating === c.id || isAvail}
                      >
                        Available
                      </button>
                      <button
                        className={`btn btn-sm flex-grow-1 extra-small py-1 ${
                          isMaint ? 'btn-warning text-dark' : 'btn-outline-secondary'
                        }`}
                        onClick={() => handleUpdateChargerStatus(c.id, 'MAINTENANCE')}
                        disabled={statusUpdating === c.id || isMaint}
                      >
                        Maintenance
                      </button>
                      <button
                        className={`btn btn-sm flex-grow-1 extra-small py-1 ${
                          isOcc ? 'btn-danger' : 'btn-outline-secondary'
                        }`}
                        onClick={() => handleUpdateChargerStatus(c.id, 'OCCUPIED')}
                        disabled={statusUpdating === c.id || isOcc}
                      >
                        Occupied
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Bookings Table */}
      <div className="card card-custom p-4">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <Calendar size={20} className="text-primary" />
          Today's Scheduled Reservations
        </h5>

        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle small mb-0">
            <thead>
              <tr className="border-bottom border-secondary text-muted">
                <th>ID</th>
                <th>Driver</th>
                <th>Port</th>
                <th>Time Window</th>
                <th>Estimated kWh</th>
                <th>Status</th>
                <th className="text-end pe-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {todaysBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-3 text-muted">
                    No reservations scheduled for today yet.
                  </td>
                </tr>
              ) : (
                todaysBookings.map((b) => (
                  <tr key={b.id} className="border-bottom border-secondary">
                    <td className="fw-bold text-light">#{b.id}</td>
                    <td>
                      <div className="fw-semibold text-white">{b.user?.name}</div>
                      <div className="text-muted extra-small">{b.user?.phone}</div>
                    </td>
                    <td>
                      {b.charger ? (
                        <span className="fw-medium text-light">{b.charger.identifier}</span>
                      ) : (
                        <span className="text-warning extra-small fst-italic">Auto-assigned</span>
                      )}
                    </td>
                    <td>
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>{b.estimatedKwh} kWh</td>
                    <td>
                      <span className={`badge ${
                        b.status === 'CONFIRMED' ? 'bg-success bg-opacity-15 text-success' :
                        b.status === 'COMPLETED' ? 'bg-info bg-opacity-15 text-info' :
                        b.status === 'CANCELLED' ? 'bg-danger bg-opacity-15 text-danger' : 'bg-secondary'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="text-end pe-3">
                      {(b.status === 'CONFIRMED' || b.status === 'PENDING') ? (
                        <button
                          className="btn btn-outline-danger btn-sm py-1 extra-small"
                          onClick={() => handleCancelBooking(b.id)}
                          disabled={cancellingBookingId === b.id}
                        >
                          {cancellingBookingId === b.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      ) : (
                        <span className="text-muted extra-small">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Feedback & Reviews */}
      <div className="card card-custom p-4 mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Star size={20} className="text-warning" fill="#f59e0b" />
            Customer Reviews & Driver Feedback ({reviews.length})
          </h5>
          <span className="text-muted small">Live customer impressions of your station</span>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            No customer reviews posted yet for this station.
          </div>
        ) : (
          <div className="row g-3">
            {reviews.map((r) => (
              <div key={r.id} className="col-12 col-md-6">
                <div className="p-3 rounded-3 bg-dark border border-secondary h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-white small">{r.user?.name || 'EV Driver'}</span>
                    <div className="d-flex text-warning">
                      {[...Array(r.rating || 5)].map((_, i) => (
                        <Star key={i} size={13} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted small mb-2">{r.comment}</p>
                  <span className="text-muted extra-small">
                    {new Date(r.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Charger Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border border-secondary text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold">Add New Charger Port</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>

              <form onSubmit={handleAddCharger}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small text-muted">Port Identifier</label>
                    <input
                      type="text"
                      className="form-control form-control-custom"
                      placeholder="e.g. CHG-05"
                      value={newCharger.identifier}
                      onChange={(e) => setNewCharger({ ...newCharger, identifier: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-muted">Speed Class</label>
                      <select
                        className="form-select form-control-custom"
                        value={newCharger.chargerType}
                        onChange={(e) => setNewCharger({ ...newCharger, chargerType: e.target.value })}
                      >
                        <option value="DC_FAST">DC Fast Charge</option>
                        <option value="AC">AC Standard</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">Connector</label>
                      <select
                        className="form-select form-control-custom"
                        value={newCharger.connectorType}
                        onChange={(e) => setNewCharger({ ...newCharger, connectorType: e.target.value })}
                      >
                        <option value="CCS2">CCS2</option>
                        <option value="TYPE2">Type 2</option>
                        <option value="CHADEMO">CHAdeMO</option>
                        <option value="GB_T">GB/T</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small text-muted">Power Output (kW)</label>
                      <input
                        type="number"
                        className="form-control form-control-custom"
                        value={newCharger.powerRatingKw}
                        onChange={(e) => setNewCharger({ ...newCharger, powerRatingKw: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">Tariff Rate (₹/kWh)</label>
                      <input
                        type="number"
                        step="0.5"
                        className="form-control form-control-custom"
                        value={newCharger.pricePerKwh}
                        onChange={(e) => setNewCharger({ ...newCharger, pricePerKwh: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm btn-custom"
                    disabled={addLoading}
                  >
                    {addLoading ? 'Saving...' : 'Create Port'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;
