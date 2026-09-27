import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldAlert, Building2, Users, DollarSign, Zap, 
  Activity, Plus, CheckCircle, XCircle, RefreshCw, AlertCircle, 
  MapPin, Star, Lock
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [adminData, setAdminData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('STATIONS'); // 'STATIONS', 'USERS', 'TRANSACTIONS'

  // Add station modal
  const [showAddStation, setShowAddStation] = useState(false);
  const [stationForm, setStationForm] = useState({
    name: '',
    address: '',
    city: 'Mumbai',
    pincode: '400051',
    latitude: 19.0657,
    longitude: 72.8687,
    pricePerKwh: 19.0,
    operatingHours: '24 / 7 Accessible',
    amenities: 'WiFi, Cafe, Washroom, EV Parking',
    operatorId: '',
    operatorName: '',
    status: 'ACTIVE'
  });
  const [savingStation, setSavingStation] = useState(false);

  // Add Port Modal (Admin)
  const [showAddPortModal, setShowAddPortModal] = useState(false);
  const [selectedStationForPort, setSelectedStationForPort] = useState(null);
  const [portForm, setPortForm] = useState({
    identifier: '',
    chargerType: 'DC_FAST',
    connectorType: 'CCS2',
    powerRatingKw: 60.0,
    pricePerKwh: 19.0
  });
  const [savingPort, setSavingPort] = useState(false);

  const fetchAdminData = async () => {
  setLoading(true);
  setError('');

  try {
    const [dashRes, usersRes, stationsRes] = await Promise.all([
      api.get('/dashboard/admin'),
      api.get('/admin/users'),
      api.get('/stations')
    ]);

    setAdminData({
      ...dashRes.data,
      stations: stationsRes.data
    });

    setUsersList(usersRes.data);
  } catch (err) {
    console.error('Admin dashboard error:', err);
    setError('Failed to fetch administrator analytics.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId, currentActive) => {
    try {
      await api.put(`/admin/users/${userId}/status`, null, {
        params: { active: !currentActive }
      });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleAddStation = async (e) => {
    e.preventDefault();
    setSavingStation(true);
    try {
      const payload = {
        ...stationForm,
        operatorId: stationForm.operatorId ? Number(stationForm.operatorId) : null
      };
      await api.post('/stations', payload);
      setShowAddStation(false);
      setStationForm({
        name: '',
        address: '',
        city: 'Mumbai',
        pincode: '400051',
        latitude: 19.0657,
        longitude: 72.8687,
        pricePerKwh: 19.0,
        operatingHours: '24 / 7 Accessible',
        amenities: 'WiFi, Cafe, Washroom, EV Parking',
        operatorId: '',
        operatorName: '',
        status: 'ACTIVE'
      });
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create charging station');
    } finally {
      setSavingStation(false);
    }
  };

  const handleOpenAddPort = (station) => {
    setSelectedStationForPort(station);
    setPortForm({
      identifier: `P-${station.totalChargers ? station.totalChargers + 1 : 1}`,
      chargerType: 'DC_FAST',
      connectorType: 'CCS2',
      powerRatingKw: 60.0,
      pricePerKwh: station.pricePerKwh || 19.0
    });
    setShowAddPortModal(true);
  };

  const handleAddPortSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStationForPort) return;
    setSavingPort(true);
    try {
      await api.post('/chargers', {
        ...portForm,
        stationId: selectedStationForPort.id,
        status: 'AVAILABLE'
      });
      setShowAddPortModal(false);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add charging port');
    } finally {
      setSavingPort(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-2"></div>
        <p className="text-muted small">Loading network-wide admin console...</p>
      </div>
    );
  }

 const {
  totalStations = 0,
  totalChargers = 0,
  totalUsers = 0,
  totalCustomers = 0,
  totalOperators = 0,
  totalBookings = 0,
  totalRevenue = 0,
  stations = []
} = adminData || {};

const totalKwhDelivered = 0;
const recentPayments = [];

const activeStations = stations.filter(
  (station) => station.status === 'ACTIVE'
).length;

const availableChargers = stations.reduce(
  (total, station) => total + (station.availableChargers || 0),
  0
);



  return (
    <div className="container py-4">
      {/* Top Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-danger bg-opacity-15 text-danger">
              🛡️ SUPER ADMIN CONSOLE
            </span>
            <span className="text-muted small">Logged in: {user?.email}</span>
          </div>
          <h2 className="fw-bold mb-1 text-white">Platform Administration</h2>
          <p className="text-muted small mb-0">
            Network oversight, station deployments, operator assignments, and revenue metrics
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-dark border-secondary btn-sm d-flex align-items-center gap-2"
            onClick={fetchAdminData}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <button
            className="btn btn-primary btn-sm btn-custom d-flex align-items-center gap-2"
            onClick={() => setShowAddStation(true)}
          >
            <Plus size={16} /> Deploy New Station
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* Network Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card card-custom p-3 h-100">
            <span className="text-muted small">Total Stations</span>
            <div className="fs-3 fw-bold text-white my-1">{totalStations}</div>
            <span className="text-success extra-small">{activeStations} Active across Maharashtra</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card card-custom p-3 h-100">
            <span className="text-muted small">Total Ports</span>
            <div className="fs-3 fw-bold text-white my-1">{totalChargers}</div>
            <span className="text-success extra-small">{availableChargers} Available for booking</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card card-custom p-3 h-100">
            <span className="text-muted small">Network Users</span>
            <div className="fs-3 fw-bold text-white my-1">{totalUsers}</div>
            <span className="text-primary extra-small">{totalCustomers} Drivers / {totalOperators} Operators</span>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card card-custom p-3 h-100">
            <span className="text-muted small">Gross Revenue</span>
            <div className="fs-3 fw-bold text-success my-1">₹{totalRevenue.toFixed(0)}</div>
            <span className="text-muted extra-small">{totalKwhDelivered.toFixed(1)} kWh delivered</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom border-secondary pb-2">
        <button
          className={`btn btn-sm ${
            activeTab === 'STATIONS' ? 'btn-primary' : 'btn-dark border-secondary text-muted'
          }`}
          onClick={() => setActiveTab('STATIONS')}
        >
          Charging Stations ({stations.length})
        </button>
        <button
          className={`btn btn-sm ${
            activeTab === 'USERS' ? 'btn-primary' : 'btn-dark border-secondary text-muted'
          }`}
          onClick={() => setActiveTab('USERS')}
        >
          User Accounts ({usersList.length})
        </button>
        <button
          className={`btn btn-sm ${
            activeTab === 'TRANSACTIONS' ? 'btn-primary' : 'btn-dark border-secondary text-muted'
          }`}
          onClick={() => setActiveTab('TRANSACTIONS')}
        >
          Recent Transactions ({recentPayments.length})
        </button>
      </div>

      {/* Tab: Stations Management */}
      {activeTab === 'STATIONS' && (
        <div className="card card-custom p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle small mb-0">
              <thead>
                <tr className="border-bottom border-secondary text-muted">
                  <th className="ps-4">Station Name</th>
                  <th>City</th>
                  <th>Tariff</th>
                  <th>Ports</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {stations.map((st) => (
                  <tr key={st.id} className="border-bottom border-secondary">
                    <td className="ps-4">
                      <div className="fw-semibold text-white">{st.name}</div>
                      <div className="text-muted extra-small">{st.address} {st.pincode ? `(${st.pincode})` : ''}</div>
                    </td>
                    <td>{st.city}</td>
                    <td>₹{st.pricePerKwh}/kWh</td>
                    <td>
                      <span className="badge bg-secondary">
                        {st.totalChargers || 0} Ports
                      </span>
                      <div className="text-success extra-small mt-1">
                        {st.availableChargers || 0} Available
                      </div>
                    </td>
                    <td>
                      <span className="text-warning fw-semibold">★ {st.rating?.toFixed(1) || '4.5'}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        st.status === 'ACTIVE' ? 'bg-success bg-opacity-15 text-success' : 'bg-warning bg-opacity-15 text-warning'
                      }`}>
                        {st.status}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-outline-primary btn-sm py-1 extra-small"
                        onClick={() => handleOpenAddPort(st)}
                      >
                        + Add Port
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: User Accounts */}
      {activeTab === 'USERS' && (
        <div className="card card-custom p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle small mb-0">
              <thead>
                <tr className="border-bottom border-secondary text-muted">
                  <th className="ps-4">Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id} className="border-bottom border-secondary">
                    <td className="ps-4 fw-semibold text-white">{u.name}</td>
                    <td className="text-muted">{u.email}</td>
                    <td className="text-muted">{u.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge ${
                        u.role === 'ROLE_ADMIN' ? 'bg-danger bg-opacity-15 text-danger' :
                        u.role === 'ROLE_OPERATOR' ? 'bg-warning bg-opacity-15 text-warning' :
                        'bg-primary bg-opacity-15 text-primary'
                      }`}>
                        {u.role.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        u.active ? 'bg-success bg-opacity-15 text-success' : 'bg-danger bg-opacity-15 text-danger'
                      }`}>
                        {u.active ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      {u.role !== 'ROLE_ADMIN' && (
                        <button
                          className={`btn btn-sm py-1 extra-small ${
                            u.active ? 'btn-outline-danger' : 'btn-outline-success'
                          }`}
                          onClick={() => handleToggleUserStatus(u.id, u.active)}
                        >
                          {u.active ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Recent Transactions */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="card card-custom p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle small mb-0">
              <thead>
                <tr className="border-bottom border-secondary text-muted">
                  <th className="ps-4">Transaction ID</th>
                  <th>Amount</th>
                  <th>Payment Mode</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-3 text-muted">
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((p) => (
                    <tr key={p.id} className="border-bottom border-secondary">
                      <td className="ps-4 font-monospace text-primary">{p.transactionReference || `TXN-${p.id}`}</td>
                      <td className="fw-bold text-white">₹{p.amount?.toFixed(2)}</td>
                      <td>
                        <span className="badge bg-secondary extra-small">{p.paymentMethod}</span>
                      </td>
                      <td>
                        <span className="badge bg-success bg-opacity-15 text-success">● {p.status}</span>
                      </td>
                      <td className="text-muted">
                        {new Date(p.paymentDate || p.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deploy New Station Modal */}
      {showAddStation && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border border-secondary text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold">Deploy New Charging Station</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddStation(false)}
                ></button>
              </div>

              <form onSubmit={handleAddStation}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label small text-muted">Station Name</label>
                    <input
                      type="text"
                      className="form-control form-control-custom form-control-sm"
                      placeholder="e.g. Jio World Drive EV Hub"
                      value={stationForm.name}
                      onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small text-muted">Full Address</label>
                    <input
                      type="text"
                      className="form-control form-control-custom form-control-sm"
                      placeholder="e.g. Bandra Kurla Complex"
                      value={stationForm.address}
                      onChange={(e) => setStationForm({ ...stationForm, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small text-muted">City</label>
                      <select
                        className="form-select form-control-custom form-control-sm"
                        value={stationForm.city}
                        onChange={(e) => setStationForm({ ...stationForm, city: e.target.value })}
                      >
                        <option value="Mumbai">Mumbai</option>
                        <option value="Navi Mumbai">Navi Mumbai</option>
                        <option value="Thane">Thane</option>
                        <option value="Pune">Pune</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">Pincode</label>
                      <input
                        type="text"
                        className="form-control form-control-custom form-control-sm"
                        value={stationForm.pincode}
                        onChange={(e) => setStationForm({ ...stationForm, pincode: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small text-muted">Tariff (₹/kWh)</label>
                      <input
                        type="number"
                        step="0.5"
                        className="form-control form-control-custom form-control-sm"
                        value={stationForm.pricePerKwh}
                        onChange={(e) => setStationForm({ ...stationForm, pricePerKwh: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">Operating Hours</label>
                      <input
                        type="text"
                        className="form-control form-control-custom form-control-sm"
                        value={stationForm.operatingHours}
                        onChange={(e) => setStationForm({ ...stationForm, operatingHours: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small text-muted">Assigned Operator</label>
                    <select
                      className="form-select form-control-custom form-control-sm"
                      value={stationForm.operatorId}
                      onChange={(e) => {
                        const opId = e.target.value;
                        const op = usersList.find(u => String(u.id) === String(opId));
                        setStationForm({
                          ...stationForm,
                          operatorId: opId,
                          operatorName: op ? op.name : ''
                        });
                      }}
                    >
                      <option value="">-- Unassigned / Network Owned --</option>
                      {usersList.filter(u => u.role === 'ROLE_OPERATOR').map(op => (
                        <option key={op.id} value={op.id}>{op.name} ({op.email})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small text-muted">Amenities</label>
                    <input
                      type="text"
                      className="form-control form-control-custom form-control-sm"
                      value={stationForm.amenities}
                      onChange={(e) => setStationForm({ ...stationForm, amenities: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowAddStation(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm btn-custom"
                    disabled={savingStation}
                  >
                    {savingStation ? 'Deploying...' : 'Deploy Station'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Port Modal (Admin) */}
      {showAddPortModal && selectedStationForPort && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border border-secondary text-white">
              <div className="modal-header border-secondary">
                <div>
                  <h5 className="modal-title fw-bold">Add Charging Port</h5>
                  <div className="text-muted extra-small">{selectedStationForPort.name} ({selectedStationForPort.city})</div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowAddPortModal(false)}
                ></button>
              </div>

              <form onSubmit={handleAddPortSubmit}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label small text-muted">Port Identifier</label>
                    <input
                      type="text"
                      className="form-control form-control-custom form-control-sm"
                      placeholder="e.g. CCS-02, TYPE2-03"
                      value={portForm.identifier}
                      onChange={(e) => setPortForm({ ...portForm, identifier: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small text-muted">Speed Class</label>
                      <select
                        className="form-select form-control-custom form-control-sm"
                        value={portForm.chargerType}
                        onChange={(e) => setPortForm({ ...portForm, chargerType: e.target.value })}
                      >
                        <option value="DC_FAST">DC Fast Charge</option>
                        <option value="AC">AC Standard</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">Connector</label>
                      <select
                        className="form-select form-control-custom form-control-sm"
                        value={portForm.connectorType}
                        onChange={(e) => setPortForm({ ...portForm, connectorType: e.target.value })}
                      >
                        <option value="CCS2">CCS2</option>
                        <option value="TYPE2">Type 2</option>
                        <option value="CHADEMO">CHAdeMO</option>
                        <option value="GB_T">GB/T</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small text-muted">Power Output (kW)</label>
                      <input
                        type="number"
                        className="form-control form-control-custom form-control-sm"
                        value={portForm.powerRatingKw}
                        onChange={(e) => setPortForm({ ...portForm, powerRatingKw: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">Tariff (₹/kWh)</label>
                      <input
                        type="number"
                        step="0.5"
                        className="form-control form-control-custom form-control-sm"
                        value={portForm.pricePerKwh}
                        onChange={(e) => setPortForm({ ...portForm, pricePerKwh: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowAddPortModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm btn-custom"
                    disabled={savingPort}
                  >
                    {savingPort ? 'Adding Port...' : 'Deploy Port'}
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

export default AdminDashboard;
