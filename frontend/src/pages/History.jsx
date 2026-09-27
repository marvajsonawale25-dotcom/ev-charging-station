import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Clock, BatteryCharging, CheckCircle, Receipt, 
  CreditCard, RefreshCw, AlertCircle, ArrowUpRight 
} from 'lucide-react';

const History = () => {
  const [activeTab, setActiveTab] = useState('SESSIONS'); // 'SESSIONS' or 'PAYMENTS'
  const [sessions, setSessions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sessRes, payRes] = await Promise.all([
        api.get('/sessions/my'),
        api.get('/payments/my')
      ]);
      setSessions(sessRes.data);
      setPayments(payRes.data);
    } catch (err) {
      setError('Unable to load history records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Clock className="text-primary" size={28} />
            Charging & Payment History
          </h2>
          <p className="text-muted small mb-0">
            Audit log of all your historical charging sessions, energy metrics, and verified transactions
          </p>
        </div>
        <button 
          className="btn btn-dark border-secondary btn-sm d-flex align-items-center gap-2"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          Refresh History
        </button>
      </div>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 border-bottom border-secondary pb-2">
        <button
          className={`btn btn-sm ${
            activeTab === 'SESSIONS' ? 'btn-primary' : 'btn-dark border-secondary text-muted'
          }`}
          onClick={() => setActiveTab('SESSIONS')}
        >
          Charging Sessions ({sessions.length})
        </button>
        <button
          className={`btn btn-sm ${
            activeTab === 'PAYMENTS' ? 'btn-primary' : 'btn-dark border-secondary text-muted'
          }`}
          onClick={() => setActiveTab('PAYMENTS')}
        >
          Payment Transactions ({payments.length})
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
          <p className="text-muted small">Loading records...</p>
        </div>
      )}

      {/* Tab: Charging Sessions */}
      {!loading && activeTab === 'SESSIONS' && (
        <div className="card card-custom p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="border-bottom border-secondary text-muted small">
                  <th className="ps-4">Session ID</th>
                  <th>Station & Port</th>
                  <th>Date & Time</th>
                  <th>Energy Delivered</th>
                  <th>Battery SoC</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted small">
                      No charging sessions recorded yet.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr key={s.id} className="border-bottom border-secondary">
                      <td className="ps-4 fw-bold text-light">#{s.id}</td>
                      <td>
                        <div className="fw-semibold text-white small">
                          {s.charger?.station?.name || 'EV Station'}
                        </div>
                        <div className="text-muted extra-small">
                          Port {s.charger?.identifier} ({s.charger?.chargerType})
                        </div>
                      </td>
                      <td className="small text-muted">
                        {new Date(s.startTime).toLocaleDateString()}{' '}
                        {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="fw-semibold text-light">
                        {s.energyDeliveredKwh?.toFixed(2) || '0.00'} kWh
                      </td>
                      <td className="small">
                        <span className="text-muted">{s.initialBatteryPercentage}%</span>
                        <span className="text-primary mx-1">→</span>
                        <span className="text-success fw-bold">{s.currentBatteryPercentage}%</span>
                      </td>
                      <td className="fw-bold text-primary">
                        ₹{s.currentCost?.toFixed(2) || '0.00'}
                      </td>
                      <td>
                        <span className={`badge ${
                          s.status === 'COMPLETED' ? 'bg-success bg-opacity-15 text-success' :
                          s.status === 'IN_PROGRESS' ? 'bg-primary bg-opacity-15 text-primary' :
                          'bg-secondary'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        {s.status === 'IN_PROGRESS' ? (
                          <Link to={`/charging/${s.id}`} className="btn btn-primary btn-sm btn-custom">
                            Live Hub
                          </Link>
                        ) : (
                          <Link to="/billing" className="btn btn-outline-secondary btn-sm">
                            Invoice <ArrowUpRight size={14} />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Payments */}
      {!loading && activeTab === 'PAYMENTS' && (
        <div className="card card-custom p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="border-bottom border-secondary text-muted small">
                  <th className="ps-4">Transaction Ref</th>
                  <th>Invoice ID</th>
                  <th>Paid Date</th>
                  <th>Payment Mode</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted small">
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="border-bottom border-secondary">
                      <td className="ps-4 font-monospace text-primary fw-semibold small">
                        {p.transactionReference || `TXN-${p.id}`}
                      </td>
                      <td className="small text-light">Bill #{p.bill?.id}</td>
                      <td className="small text-muted">
                        {new Date(p.paymentDate || p.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td>
                        <span className="badge bg-secondary extra-small">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="fw-bold text-white fs-6">
                        ₹{p.amount?.toFixed(2)}
                      </td>
                      <td>
                        <span className="badge bg-success bg-opacity-15 text-success">
                          ● {p.status}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <Link to={`/billing/${p.bill?.id}`} className="btn btn-outline-primary btn-sm">
                          <Receipt size={14} className="me-1" /> View Invoice
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
