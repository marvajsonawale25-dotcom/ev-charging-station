import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Receipt, CheckCircle, CreditCard, QrCode, Smartphone, 
  DollarSign, Download, ArrowLeft, AlertCircle, ShieldCheck, Printer
} from 'lucide-react';

const Billing = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const fetchBills = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bills/my');
      setBills(res.data);

      if (id) {
        const found = res.data.find((b) => b.id === Number(id));
        if (found) setSelectedBill(found);
        else if (res.data.length > 0) setSelectedBill(res.data[0]);
      } else if (res.data.length > 0) {
        // default select first unpaid, or first bill
        const unpaid = res.data.find(b => b.paymentStatus === 'UNPAID');
        setSelectedBill(unpaid || res.data[0]);
      }
    } catch (err) {
      setError('Unable to load billing invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [id]);

  const handleProcessPayment = async () => {
    if (!selectedBill) return;
    setPaying(true);
    try {
      const res = await api.post('/payments/process', {
        billId: selectedBill.id,
        paymentMethod
      });
      setPaymentSuccess(res.data);
      // Refresh bills list
      await fetchBills();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment processing failed');
    } finally {
      setPaying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted">Loading tax invoices...</p>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className="container py-5">
        <div className="card card-custom p-5 text-center">
          <Receipt size={48} className="text-muted mx-auto mb-3" />
          <h4 className="fw-bold mb-2">No Invoices Found</h4>
          <p className="text-muted small mb-4">
            You don't have any generated charging invoices yet. Complete a charging session to view your itemized bill.
          </p>
          <div>
            <Link to="/stations" className="btn btn-primary btn-custom">
              Explore Stations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const bill = selectedBill || bills[0];
  const isPaid = bill?.paymentStatus === 'PAID';

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Receipt className="text-primary" size={28} />
            Invoices & Payment
          </h2>
          <p className="text-muted small mb-0">
            GST-compliant digital invoices and instant mock payment checkout
          </p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={handlePrint} className="btn btn-dark border-secondary btn-sm d-flex align-items-center gap-2">
            <Printer size={16} /> Print Invoice
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Left: Invoice History Selector List */}
        <div className="col-12 col-lg-4">
          <div className="card card-custom p-3 mb-4">
            <h6 className="fw-bold mb-3 text-muted text-uppercase tracking-wider extra-small">
              Your Invoices ({bills.length})
            </h6>
            <div className="d-flex flex-column gap-2">
              {bills.map((b) => {
                const isSelected = bill?.id === b.id;
                const paid = b.paymentStatus === 'PAID';

                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBill(b);
                      setPaymentSuccess(null);
                    }}
                    className={`p-3 rounded-3 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary bg-opacity-10'
                        : 'border-secondary bg-dark hover-border'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span className="fw-bold text-white small">
                        Invoice #{b.id}
                      </span>
                      <span className={`badge ${
                        paid ? 'bg-success bg-opacity-15 text-success' : 'bg-warning bg-opacity-15 text-warning'
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center text-muted extra-small">
                      <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                      <span className="fw-bold text-light fs-6">₹{b.totalAmount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Invoice Display & Payment Gateway */}
        <div className="col-12 col-lg-8">
          {/* Tax Invoice Document */}
          <div className="card card-custom p-4 p-md-5 mb-4" id="printable-invoice">
            {/* Invoice Top Header */}
            <div className="d-flex justify-content-between align-items-start border-bottom border-secondary pb-4 mb-4">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <div className="bg-primary text-dark p-2 rounded-2 fw-bold">⚡ VP</div>
                  <span className="fw-extrabold fs-4 text-white">VoltPoint EV</span>
                </div>
                <p className="text-muted extra-small mb-0">
                  VoltPoint Technologies India Pvt Ltd.<br />
                  GSTIN: 27AAACV1234F1Z5<br />
                  Bandra-Kurla Complex (BKC), Mumbai - 400051
                </p>
              </div>

              <div className="text-end">
                <span className={`badge mb-2 fs-6 ${
                  isPaid ? 'bg-success text-white' : 'bg-warning text-dark'
                }`}>
                  {isPaid ? 'PAID & SETTLED' : 'PAYMENT DUE'}
                </span>
                <div className="fw-bold text-white">TAX INVOICE #{bill.id}</div>
                <div className="text-muted extra-small">
                  Date: {new Date(bill.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Bill To & Station info */}
            <div className="row g-3 mb-4 small">
              <div className="col-6">
                <span className="text-muted d-block extra-small text-uppercase">Billed To</span>
                <strong className="text-light">{bill.user?.name || 'EV Driver'}</strong>
                <div className="text-muted extra-small">{bill.user?.email}</div>
                <div className="text-muted extra-small">{bill.user?.phone}</div>
              </div>
              <div className="col-6 text-end">
                <span className="text-muted d-block extra-small text-uppercase">Charging Location</span>
                <strong className="text-light">{bill.session?.charger?.station?.name || 'VoltPoint Hub'}</strong>
                <div className="text-muted extra-small">
                  Port {bill.session?.charger?.identifier} ({bill.session?.charger?.chargerType})
                </div>
                <div className="text-muted extra-small">
                  {bill.session?.charger?.station?.city}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="table-responsive mb-4">
              <table className="table table-dark table-borderless small mb-0">
                <thead>
                  <tr className="border-bottom border-secondary text-muted">
                    <th>Description</th>
                    <th className="text-center">Energy (Units)</th>
                    <th className="text-center">Rate</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-bottom border-secondary">
                    <td>
                      <strong className="text-light">EV Fast Charging Energy Consumption</strong>
                      <div className="text-muted extra-small">
                        Session #{bill.session?.id} | {bill.session?.charger?.powerKw}kW DC/AC Port
                      </div>
                    </td>
                    <td className="text-center">{bill.totalKwh?.toFixed(2)} kWh</td>
                    <td className="text-center">₹{bill.session?.charger?.pricePerKwh || 18.0}/kWh</td>
                    <td className="text-end fw-semibold text-light">₹{bill.baseAmount?.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Subtotals & GST Breakdown */}
            <div className="row justify-content-end mb-4">
              <div className="col-12 col-md-6 small">
                <div className="d-flex justify-content-between py-1 text-muted">
                  <span>Subtotal (Base Energy Charge)</span>
                  <span className="text-light">₹{bill.baseAmount?.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between py-1 text-muted">
                  <span>Central GST (CGST @ 9%)</span>
                  <span className="text-light">₹{(bill.taxAmount / 2).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between py-1 text-muted">
                  <span>State GST (SGST @ 9%)</span>
                  <span className="text-light">₹{(bill.taxAmount / 2).toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-top border-secondary text-white fw-bold fs-5">
                  <span>Total Payable</span>
                  <span className="text-primary">₹{bill.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Paid Stamp / Verification info */}
            {isPaid && (
              <div className="p-3 bg-success bg-opacity-10 border border-success rounded-3 d-flex align-items-center gap-3">
                <CheckCircle size={28} className="text-success flex-shrink-0" />
                <div>
                  <div className="fw-bold text-success small">Payment Confirmed & Verified</div>
                  <div className="text-muted extra-small">
                    Paid via {paymentMethod} | Reference ID: TXN-{Math.abs(bill.id * 837492).toString().slice(0, 8)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Gateway Simulator (Only if Unpaid) */}
          {!isPaid && (
            <div className="card card-custom p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <ShieldCheck size={20} className="text-primary" />
                Select Payment Mode
              </h5>

              {/* Payment Method Selector Pills */}
              <div className="row g-2 mb-4">
                <div className="col-4">
                  <div
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-3 border text-center cursor-pointer transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-primary bg-primary bg-opacity-10 text-primary fw-bold'
                        : 'border-secondary bg-dark text-muted'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <Smartphone size={24} className="mb-1 d-block mx-auto" />
                    <span className="small">UPI / QR</span>
                  </div>
                </div>

                <div className="col-4">
                  <div
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-3 border text-center cursor-pointer transition-all ${
                      paymentMethod === 'CARD'
                        ? 'border-primary bg-primary bg-opacity-10 text-primary fw-bold'
                        : 'border-secondary bg-dark text-muted'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <CreditCard size={24} className="mb-1 d-block mx-auto" />
                    <span className="small">Debit / Card</span>
                  </div>
                </div>

                <div className="col-4">
                  <div
                    onClick={() => setPaymentMethod('WALLET')}
                    className={`p-3 rounded-3 border text-center cursor-pointer transition-all ${
                      paymentMethod === 'WALLET'
                        ? 'border-primary bg-primary bg-opacity-10 text-primary fw-bold'
                        : 'border-secondary bg-dark text-muted'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <DollarSign size={24} className="mb-1 d-block mx-auto" />
                    <span className="small">EV Wallet</span>
                  </div>
                </div>
              </div>

              {/* UPI Simulator Box */}
              {paymentMethod === 'UPI' && (
                <div className="p-3 bg-dark rounded-3 border border-secondary mb-4 text-center">
                  <span className="text-muted extra-small d-block mb-2">
                    Scan with GPay, PhonePe, Paytm, or BHIM
                  </span>
                  <div className="d-inline-block p-3 bg-white rounded-3 shadow-sm mb-2">
                    <QrCode size={140} color="#000" />
                  </div>
                  <div className="text-muted small">UPI ID: <strong className="text-light">voltpoint.fastpay@okhdfcbank</strong></div>
                </div>
              )}

              {/* Card Simulator Box */}
              {paymentMethod === 'CARD' && (
                <div className="p-3 bg-dark rounded-3 border border-secondary mb-4">
                  <div className="mb-2">
                    <label className="text-muted extra-small">Card Number</label>
                    <input
                      type="text"
                      className="form-control form-control-custom form-control-sm"
                      placeholder="4532 •••• •••• 8921"
                      defaultValue="4532 8291 0019 8921"
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="text-muted extra-small">Expiry</label>
                      <input
                        type="text"
                        className="form-control form-control-custom form-control-sm"
                        placeholder="MM/YY"
                        defaultValue="12/28"
                      />
                    </div>
                    <div className="col-6">
                      <label className="text-muted extra-small">CVV</label>
                      <input
                        type="password"
                        className="form-control form-control-custom form-control-sm"
                        placeholder="•••"
                        defaultValue="982"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Simulator Box */}
              {paymentMethod === 'WALLET' && (
                <div className="p-3 bg-dark rounded-3 border border-secondary mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-muted extra-small d-block">VoltPoint Pre-Paid Wallet</span>
                      <strong className="text-white">Available Balance: ₹5,000.00</strong>
                    </div>
                    <span className="badge bg-success">Sufficient</span>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                className="btn btn-primary btn-custom w-100 py-2 fs-6 d-flex align-items-center justify-content-center gap-2"
                onClick={handleProcessPayment}
                disabled={paying}
              >
                {paying ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    Processing Transaction...
                  </>
                ) : (
                  <>
                    Pay ₹{bill.totalAmount?.toFixed(2)} Now
                  </>
                )}
              </button>

              <p className="text-muted extra-small text-center mt-2 mb-0">
                🔒 Safe 256-Bit Encrypted Simulated Payment Gateway
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;
