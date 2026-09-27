import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  Car, Plus, Trash2, BatteryCharging, Zap, 
  ShieldCheck, AlertCircle, CheckCircle, Sparkles 
} from 'lucide-react';

const PRESET_VEHICLES = [
  { make: 'Tata', model: 'Nexon EV Max', year: 2024, batteryCapacityKwh: 40.5, maxChargingPowerKw: 50.0, connectorType: 'CCS2' },
  { make: 'MG', model: 'ZS EV', year: 2023, batteryCapacityKwh: 50.3, maxChargingPowerKw: 50.0, connectorType: 'CCS2' },
  { make: 'Mahindra', model: 'XUV400 EV', year: 2024, batteryCapacityKwh: 39.4, maxChargingPowerKw: 50.0, connectorType: 'CCS2' },
  { make: 'Hyundai', model: 'Ioniq 5', year: 2024, batteryCapacityKwh: 72.6, maxChargingPowerKw: 150.0, connectorType: 'CCS2' },
  { make: 'Tata', model: 'Tiago EV', year: 2023, batteryCapacityKwh: 24.0, maxChargingPowerKw: 7.4, connectorType: 'TYPE2' }
];

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: 2024,
    registrationNumber: '',
    batteryCapacityKwh: 40.0,
    maxChargingPowerKw: 50.0,
    connectorType: 'CCS2'
  });

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/vehicles/my');
      setVehicles(res.data);
    } catch (err) {
      setError('Unable to load registered vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleApplyPreset = (preset) => {
    setFormData({
      ...formData,
      make: preset.make,
      model: preset.model,
      year: preset.year,
      batteryCapacityKwh: preset.batteryCapacityKwh,
      maxChargingPowerKw: preset.maxChargingPowerKw,
      connectorType: preset.connectorType
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        modelName: `${formData.make} ${formData.model}`.trim() || formData.make || 'Electric Vehicle',
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        batteryCapacityKwh: Number(formData.batteryCapacityKwh),
        connectorType: formData.connectorType
      };
      await api.post('/vehicles', payload);
      setShowModal(false);
      setFormData({
        make: '',
        model: '',
        year: 2024,
        registrationNumber: '',
        batteryCapacityKwh: 40.0,
        maxChargingPowerKw: 50.0,
        connectorType: 'CCS2'
      });
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${vehicleId}`);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove vehicle');
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Car className="text-primary" size={28} />
            My EV Garage
          </h2>
          <p className="text-muted small mb-0">
            Manage your registered electric vehicles for accurate charging times and connector matching
          </p>
        </div>
        <button
          className="btn btn-primary btn-custom d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Register New EV
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
          <div className="spinner-border text-primary mb-2"></div>
          <p className="text-muted small">Loading your garage...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && vehicles.length === 0 && (
        <div className="card card-custom p-5 text-center">
          <Car size={48} className="text-muted mx-auto mb-3" />
          <h4 className="fw-bold mb-2">No Vehicles Registered</h4>
          <p className="text-muted small mb-4">
            Add your EV to your profile to get personalized charging slot estimations and connector compatibility checks.
          </p>
          <div>
            <button className="btn btn-primary btn-custom" onClick={() => setShowModal(true)}>
              <Plus size={16} className="me-1" /> Add Your First EV
            </button>
          </div>
        </div>
      )}

      {/* Vehicles Grid */}
      {!loading && vehicles.length > 0 && (
        <div className="row g-4">
          {vehicles.map((v) => (
            <div key={v.id} className="col-12 col-md-6 col-lg-4">
              <div className="card card-custom h-100 p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary bg-opacity-15 text-primary">
                      {v.connectorType} Compatible
                    </span>
                    <button
                      className="btn btn-outline-danger btn-sm p-1 border-0"
                      onClick={() => handleDelete(v.id)}
                      title="Remove Vehicle"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h5 className="fw-bold text-white mb-1">
                    {v.modelName || `${v.make || ''} ${v.model || ''}`}
                  </h5>
                  <div className="d-inline-block px-2 py-1 bg-dark rounded border border-secondary text-muted extra-small mb-3 font-monospace">
                    {v.registrationNumber}
                  </div>

                  <div className="row g-2 small text-muted border-top border-secondary pt-3">
                    <div className="col-6">
                      <span className="extra-small text-muted d-block">Battery Size</span>
                      <strong className="text-light">{v.batteryCapacityKwh} kWh</strong>
                    </div>
                    <div className="col-6">
                      <span className="extra-small text-muted d-block">Max Charge Rate</span>
                      <strong className="text-light">{v.maxChargingPowerKw} kW</strong>
                    </div>
                    <div className="col-6">
                      <span className="extra-small text-muted d-block">Model Year</span>
                      <strong className="text-light">{v.year || '2024'}</strong>
                    </div>
                    <div className="col-6">
                      <span className="extra-small text-muted d-block">Fast Charging</span>
                      <strong className="text-success">Supported</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-top border-secondary mt-3 d-flex justify-content-between align-items-center extra-small text-muted">
                  <span>Registered EV</span>
                  <span className="text-success d-flex align-items-center gap-1">
                    <ShieldCheck size={14} /> Ready for Booking
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border border-secondary text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Car className="text-primary" size={20} /> Add Electric Vehicle
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                {/* 1-Click Presets */}
                <div className="mb-3">
                  <span className="extra-small text-muted d-block mb-2 fw-semibold">
                    <Sparkles size={12} className="text-warning me-1" /> Quick Presets (Click to autofill):
                  </span>
                  <div className="d-flex flex-wrap gap-1">
                    {PRESET_VEHICLES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="btn btn-outline-secondary btn-sm extra-small py-1 px-2"
                        onClick={() => handleApplyPreset(preset)}
                      >
                        {preset.make} {preset.model}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small text-muted">Make / Manufacturer</label>
                      <input
                        type="text"
                        className="form-control form-control-custom form-control-sm"
                        placeholder="e.g. Tata"
                        value={formData.make}
                        onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">Model</label>
                      <input
                        type="text"
                        className="form-control form-control-custom form-control-sm"
                        placeholder="e.g. Nexon EV Max"
                        value={formData.model}
                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small text-muted">Number Plate / Reg No</label>
                      <input
                        type="text"
                        className="form-control form-control-custom form-control-sm font-monospace"
                        placeholder="e.g. MH 02 CD 4589"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">Year</label>
                      <input
                        type="number"
                        className="form-control form-control-custom form-control-sm"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        min="2015"
                        max="2026"
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small text-muted">Battery Size (kWh)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-custom form-control-sm"
                        value={formData.batteryCapacityKwh}
                        onChange={(e) => setFormData({ ...formData, batteryCapacityKwh: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-muted">Max Power (kW)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control form-control-custom form-control-sm"
                        value={formData.maxChargingPowerKw}
                        onChange={(e) => setFormData({ ...formData, maxChargingPowerKw: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small text-muted">Connector Standard</label>
                    <select
                      className="form-select form-control-custom form-control-sm"
                      value={formData.connectorType}
                      onChange={(e) => setFormData({ ...formData, connectorType: e.target.value })}
                    >
                      <option value="CCS2">CCS Type 2 (Standard DC Fast in India)</option>
                      <option value="TYPE2">Type 2 AC (Mennekes)</option>
                      <option value="CHADEMO">CHAdeMO</option>
                      <option value="GB_T">GB/T</option>
                    </select>
                  </div>

                  <div className="modal-footer border-secondary px-0 pb-0">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm btn-custom"
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : 'Save Vehicle'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
