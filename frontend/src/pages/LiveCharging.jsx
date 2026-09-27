import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Zap, BatteryCharging, Clock, DollarSign, Activity, 
  Square, FastForward, CheckCircle, AlertTriangle, ShieldAlert,
  ArrowRight, RefreshCw, Cpu
} from 'lucide-react';

const LiveCharging = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stopping, setStopping] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const pollIntervalRef = useRef(null);

  const fetchSession = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      let res;
      if (id && id !== 'active') {
        res = await api.get(`/sessions/${id}`);
      } else {
        res = await api.get('/sessions/active');
      }
      setSession(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'No active charging session found.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession(true);

    // Auto poll every 3 seconds for live telemetry updates
    pollIntervalRef.current = setInterval(() => {
      fetchSession(false);
    }, 3000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [id]);

  // Fast forward simulation tick (e.g. +5, +15, +30 mins)
  const handleFastForward = async (minutes) => {
    if (!session || session.status !== 'IN_PROGRESS') return;
    setSimulating(true);
    try {
      const res = await api.post(`/sessions/${session.id}/tick?minutes=${minutes}`);
      setSession(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to simulate time tick.');
    } finally {
      setSimulating(false);
    }
  };

  // Stop charging session and redirect to billing
  const handleStopCharging = async () => {
    if (!session) return;
    if (!window.confirm('Are you sure you want to stop charging? Your bill will be generated immediately.')) return;
    setStopping(true);
    try {
      const res = await api.post(`/sessions/${session.id}/stop`);
      // Session stopped, now fetch or redirect to bill
      const billRes = await api.get('/bills/my');
      const latestBill = billRes.data.find(b => b.session?.id === session.id);
      if (latestBill) {
        navigate(`/billing/${latestBill.id}`);
      } else {
        navigate('/billing');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to stop session');
      setStopping(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted">Connecting to EV Charging Telemetry Hub...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container py-5">
        <div className="card card-custom p-5 text-center">
          <BatteryCharging size={48} className="text-muted mx-auto mb-3" />
          <h4 className="fw-bold mb-2">No Active Charging Session</h4>
          <p className="text-muted small mb-4">
            {error || 'You do not have a live charging session running at this moment.'}
          </p>
          <div>
            <button className="btn btn-primary btn-custom" onClick={() => navigate('/bookings')}>
              Go to My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = session.status === 'COMPLETED';
  const batteryPercent = Math.min(100, Math.round(session.currentBatteryPercentage || 0));
  const powerKw = session.charger?.powerKw || 50;

  // Calculate elapsed time from start time
  const startTime = new Date(session.startTime);
  const endTime = session.endTime ? new Date(session.endTime) : new Date();
  const elapsedMs = Math.max(0, endTime - startTime);
  const elapsedMins = Math.floor(elapsedMs / (1000 * 60));
  const elapsedSecs = Math.floor((elapsedMs % (1000 * 60)) / 1000);

  return (
    <div className="container py-4">
      {/* Top Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className={`badge ${
              session.status === 'IN_PROGRESS' 
                ? 'bg-success bg-opacity-15 text-success' 
                : 'bg-info bg-opacity-15 text-info'
            }`}>
              ● {session.status === 'IN_PROGRESS' ? 'CHARGING IN PROGRESS' : session.status}
            </span>
            <span className="text-muted small">Session #{session.id}</span>
          </div>
          <h2 className="fw-bold mb-1 text-white">
            {session.charger?.station?.name || 'EV Station'}
          </h2>
          <p className="text-muted small mb-0">
            Port {session.charger?.identifier} ({session.charger?.chargerType} - {powerKw} kW Fast Charger)
          </p>
        </div>

        {session.status === 'IN_PROGRESS' ? (
          <button
            className="btn btn-danger btn-custom d-flex align-items-center gap-2"
            onClick={handleStopCharging}
            disabled={stopping}
          >
            {stopping ? (
              <>
                <span className="spinner-border spinner-border-sm"></span>
                Generating Invoice...
              </>
            ) : (
              <>
                <Square size={16} fill="currentColor" /> Stop Charging & Pay
              </>
            )}
          </button>
        ) : (
          <button
            className="btn btn-primary btn-custom d-flex align-items-center gap-2"
            onClick={() => navigate('/billing')}
          >
            View Bill & Invoices <ArrowRight size={16} />
          </button>
        )}
      </div>

      <div className="row g-4">
        {/* Left Column: Battery Animation & Telemetry Gauge */}
        <div className="col-12 col-lg-7">
          <div className="card card-custom p-4 text-center mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-muted small fw-semibold text-uppercase tracking-wider">
                Battery State of Charge (SoC)
              </span>
              <span className="badge bg-primary bg-opacity-15 text-primary">
                {session.status === 'IN_PROGRESS' ? '⚡ Active Delivery' : 'Completed'}
              </span>
            </div>

            {/* Visual Battery Gauge */}
            <div className="position-relative my-4" style={{ maxWidth: '380px', margin: '0 auto' }}>
              <div 
                className="p-3 rounded-4 border border-secondary bg-dark position-relative overflow-hidden"
                style={{ height: '140px' }}
              >
                {/* Battery fill bar with gradient and glow */}
                <div
                  className="h-100 rounded-3 transition-all"
                  style={{
                    width: `${batteryPercent}%`,
                    background: batteryPercent > 80 
                      ? 'linear-gradient(90deg, #10b981, #059669)' 
                      : 'linear-gradient(90deg, #0284c7, #22c55e)',
                    boxShadow: session.status === 'IN_PROGRESS' ? '0 0 25px rgba(34, 197, 94, 0.4)' : 'none',
                    transition: 'width 0.8s ease-in-out'
                  }}
                ></div>

                {/* Overlay Text */}
                <div className="position-absolute top-50 start-50 translate-middle text-center w-100">
                  <div className="display-4 fw-extrabold text-white">
                    {batteryPercent}%
                  </div>
                  <div className="text-light small fw-medium">
                    {session.initialBatteryPercentage}% → {batteryPercent}% Target
                  </div>
                </div>
              </div>

              {/* Battery Nipple */}
              <div
                className="position-absolute top-50 bg-secondary rounded-end"
                style={{
                  width: '12px',
                  height: '40px',
                  right: '-12px',
                  transform: 'translateY(-50%)'
                }}
              ></div>
            </div>

            {/* Fast-Forward Simulation Controller (VIVA FEATURE) */}
            {session.status === 'IN_PROGRESS' && (
              <div className="p-3 bg-dark rounded-3 border border-secondary mt-3 text-start">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-warning small fw-bold d-flex align-items-center gap-1">
                    <Cpu size={16} /> Viva Demo Fast-Forward Simulator
                  </span>
                  <span className="text-muted extra-small">Simulate hardware charging ticks</span>
                </div>
                <p className="text-muted extra-small mb-3">
                  Click the buttons below to fast-forward simulated vehicle charging time in software:
                </p>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                    onClick={() => handleFastForward(5)}
                    disabled={simulating || batteryPercent >= 100}
                  >
                    <FastForward size={14} /> +5 Mins
                  </button>
                  <button
                    className="btn btn-outline-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                    onClick={() => handleFastForward(15)}
                    disabled={simulating || batteryPercent >= 100}
                  >
                    <FastForward size={14} /> +15 Mins
                  </button>
                  <button
                    className="btn btn-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                    onClick={() => handleFastForward(30)}
                    disabled={simulating || batteryPercent >= 100}
                  >
                    <FastForward size={14} /> +30 Mins
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Telemetry Numbers */}
        <div className="col-12 col-lg-5">
          <div className="card card-custom p-4 mb-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Activity className="text-primary" size={20} />
              Real-Time Telemetry
            </h5>

            <div className="row g-3">
              {/* Energy Delivered */}
              <div className="col-6">
                <div className="p-3 bg-dark rounded-3 border border-secondary">
                  <span className="text-muted extra-small d-block mb-1">Energy Delivered</span>
                  <div className="fs-3 fw-bold text-white">
                    {session.energyDeliveredKwh?.toFixed(2) || '0.00'}
                    <span className="fs-6 fw-normal text-muted ms-1">kWh</span>
                  </div>
                </div>
              </div>

              {/* Accumulated Cost */}
              <div className="col-6">
                <div className="p-3 bg-dark rounded-3 border border-secondary">
                  <span className="text-muted extra-small d-block mb-1">Current Cost</span>
                  <div className="fs-3 fw-bold text-primary">
                    ₹{session.currentCost?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>

              {/* Charging Speed */}
              <div className="col-6">
                <div className="p-3 bg-dark rounded-3 border border-secondary">
                  <span className="text-muted extra-small d-block mb-1">Delivered Power</span>
                  <div className="fs-4 fw-bold text-light">
                    {session.status === 'IN_PROGRESS' ? powerKw : 0}
                    <span className="fs-6 fw-normal text-muted ms-1">kW</span>
                  </div>
                </div>
              </div>

              {/* Elapsed Time */}
              <div className="col-6">
                <div className="p-3 bg-dark rounded-3 border border-secondary">
                  <span className="text-muted extra-small d-block mb-1">Elapsed Time</span>
                  <div className="fs-4 fw-bold text-light">
                    {elapsedMins}m {elapsedSecs}s
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-secondary my-3" />

            {/* Vehicle & Charger specs */}
            <div className="small">
              <div className="d-flex justify-content-between py-1 text-muted">
                <span>Vehicle</span>
                <span className="text-light fw-medium">
                  {session.vehicle ? `${session.vehicle.make} ${session.vehicle.model}` : 'Standard EV'}
                </span>
              </div>
              <div className="d-flex justify-content-between py-1 text-muted">
                <span>Connector Standard</span>
                <span className="text-light fw-medium">{session.charger?.connectorType}</span>
              </div>
              <div className="d-flex justify-content-between py-1 text-muted">
                <span>Tariff Rate</span>
                <span className="text-light fw-medium">₹{session.charger?.pricePerKwh}/kWh</span>
              </div>
              <div className="d-flex justify-content-between py-1 text-muted">
                <span>Session Started</span>
                <span className="text-light fw-medium">
                  {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {session.status === 'IN_PROGRESS' && (
              <div className="mt-4 pt-2">
                <button
                  className="btn btn-danger btn-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleStopCharging}
                  disabled={stopping}
                >
                  <Square size={16} fill="currentColor" /> Stop Session & Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCharging;
