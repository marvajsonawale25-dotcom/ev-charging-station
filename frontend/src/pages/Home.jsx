import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Zap, MapPin, Calendar, Activity, CreditCard, Award, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [stations, setStations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/stations')
      .then(res => setStations(res.data.slice(0, 3)))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/stations?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container py-4">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <div className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill fw-semibold mb-3 d-inline-flex align-items-center gap-1">
                <Zap size={15} /> Next-Gen EV Mobility & Station Booking
              </div>
              <h1 className="display-4 fw-extrabold text-dark mb-3" style={{ letterSpacing: '-1px' }}>
                Charge Your EV <span style={{ color: '#10B981' }}>Anywhere, Anytime</span> Without Waiting.
              </h1>
              <p className="lead text-muted mb-4">
                Discover fast charging hubs across Mumbai & Navi Mumbai, reserve guaranteed slots in advance, experience live simulated charging telemetry, and pay seamlessly.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="p-2 bg-white rounded-4 shadow-sm border mb-3 d-flex flex-column flex-sm-row gap-2" style={{ maxWidth: '600px' }}>
                <div className="d-flex align-items-center flex-grow-1 px-3">
                  <MapPin size={20} className="text-muted me-2" />
                  <input
                    type="text"
                    className="form-control border-0 shadow-none px-0"
                    placeholder="Search by station name, area (BKC, Vashi, Powai...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-emerald py-2 px-4 justify-content-center">
                  Find Chargers
                </button>
              </form>

              {/* Quick Area Filters */}
              <div className="d-flex align-items-center gap-2 flex-wrap text-muted small">
                <span className="fw-semibold">Popular Hubs:</span>
                <button onClick={() => navigate('/stations?city=Mumbai')} className="btn btn-sm btn-light border py-1 px-2 rounded-pill">Mumbai</button>
                <button onClick={() => navigate('/stations?city=Navi Mumbai')} className="btn btn-sm btn-light border py-1 px-2 rounded-pill">Navi Mumbai</button>
                <button onClick={() => navigate('/stations?city=Thane')} className="btn btn-sm btn-light border py-1 px-2 rounded-pill">Thane</button>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="col-lg-5">
              <div className="ev-card p-4 bg-white shadow-lg" style={{ border: '2px solid #A7F3D0' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill">
                    ● Live Station Feed
                  </span>
                  <span className="text-muted small">Updated Real-Time</span>
                </div>

                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="fw-bold text-dark mb-0">VoltPulse BKC Supercharge</h6>
                    <span className="badge bg-success text-white small">2/3 Available</span>
                  </div>
                  <div className="text-muted small mb-2">Bandra Kurla Complex, Bandra East</div>
                  <div className="d-flex gap-2">
                    <span className="badge bg-dark text-light small">DC Fast 120kW</span>
                    <span className="badge bg-light text-dark border small">CCS2</span>
                    <span className="badge bg-light text-dark border small">₹19.5/kWh</span>
                  </div>
                </div>

                <div className="p-3 bg-light rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="fw-bold text-dark mb-0">GreenRoute Vashi Station</h6>
                    <span className="badge bg-success text-white small">3/3 Available</span>
                  </div>
                  <div className="text-muted small mb-2">Sector 17, Near Vashi Plaza</div>
                  <div className="d-flex gap-2">
                    <span className="badge bg-dark text-light small">DC Fast 50kW</span>
                    <span className="badge bg-light text-dark border small">CCS2</span>
                    <span className="badge bg-light text-dark border small">₹18.0/kWh</span>
                  </div>
                </div>

                <div className="p-3 rounded-3" style={{ background: '#ECFDF5', border: '1px dashed #10B981' }}>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="fw-bold text-success small">Zero Wait Guarantee</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>Reserve your slot in 3 clicks and avoid station queues.</div>
                    </div>
                    <Link to="/stations" className="btn btn-sm btn-emerald text-decoration-none">
                      Explore
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step Core Workflow Section */}
      <section className="py-5 bg-white">
        <div className="container py-3">
          <div className="text-center max-w-700 mx-auto mb-5">
            <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2">Product Lifecycle</span>
            <h2 className="fw-extrabold text-dark">The 5-Step EV Charging Journey</h2>
            <p className="text-muted">Designed around the core product principle: Discover → Reserve → Charge → Pay → Track</p>
          </div>

          <div className="row g-4">
            <div className="col-lg col-md-6">
              <div className="ev-card p-4 text-center h-100">
                <div className="metric-icon-box mx-auto mb-3" style={{ backgroundColor: '#ECFDF5', color: '#10B981' }}>
                  <MapPin size={26} />
                </div>
                <div className="badge bg-light text-dark border mb-2">Step 1</div>
                <h5 className="fw-bold text-dark">1. Discover</h5>
                <p className="text-muted small mb-0">Search nearby charging stations in Mumbai/Navi Mumbai with real-time slot and charger speed info.</p>
              </div>
            </div>

            <div className="col-lg col-md-6">
              <div className="ev-card p-4 text-center h-100">
                <div className="metric-icon-box mx-auto mb-3" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
                  <Calendar size={26} />
                </div>
                <div className="badge bg-light text-dark border mb-2">Step 2</div>
                <h5 className="fw-bold text-dark">2. Reserve</h5>
                <p className="text-muted small mb-0">Select your EV, pick a compatible charger (CCS2/Type-2), choose your time slot, and lock your bay.</p>
              </div>
            </div>

            <div className="col-lg col-md-6">
              <div className="ev-card p-4 text-center h-100">
                <div className="metric-icon-box mx-auto mb-3" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                  <Activity size={26} />
                </div>
                <div className="badge bg-light text-dark border mb-2">Step 3</div>
                <h5 className="fw-bold text-dark">3. Charge</h5>
                <p className="text-muted small mb-0">Start charging and watch simulated telemetry: live battery SoC %, units consumed (kWh), and real-time cost.</p>
              </div>
            </div>

            <div className="col-lg col-md-6">
              <div className="ev-card p-4 text-center h-100">
                <div className="metric-icon-box mx-auto mb-3" style={{ backgroundColor: '#F3E8FF', color: '#9333EA' }}>
                  <CreditCard size={26} />
                </div>
                <div className="badge bg-light text-dark border mb-2">Step 4</div>
                <h5 className="fw-bold text-dark">4. Pay</h5>
                <p className="text-muted small mb-0">Review itemized GST tax invoices and complete simulated payment instantly via UPI, Card, or EV Wallet.</p>
              </div>
            </div>

            <div className="col-lg col-md-6">
              <div className="ev-card p-4 text-center h-100">
                <div className="metric-icon-box mx-auto mb-3" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                  <Award size={26} />
                </div>
                <div className="badge bg-light text-dark border mb-2">Step 5</div>
                <h5 className="fw-bold text-dark">5. Track</h5>
                <p className="text-muted small mb-0">Monitor total money spent, energy consumed, and kilograms of carbon emission offset against petrol cars.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stations Showcase */}
      <section className="py-5 bg-light">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
              <span className="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-1 rounded-pill mb-2">Prime Locations</span>
              <h2 className="fw-extrabold text-dark mb-0">Featured Charging Stations</h2>
            </div>
            <Link to="/stations" className="btn-outline-emerald text-decoration-none">
              View All Stations <ArrowRight size={16} />
            </Link>
          </div>

          <div className="row g-4">
            {stations.map(station => (
              <div key={station.id} className="col-md-4">
                <div className="ev-card h-100 p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-dark text-white">{station.city}</span>
                      <span className="badge bg-success bg-opacity-10 text-success fw-bold border border-success border-opacity-25">
                        {station.availableChargers}/{station.totalChargers} Available
                      </span>
                    </div>
                    <h5 className="fw-bold text-dark mb-1">{station.name}</h5>
                    <p className="text-muted small mb-3">{station.address}</p>
                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {station.amenities?.split(',').slice(0, 3).map((a, i) => (
                        <span key={i} className="badge bg-light text-secondary border small">{a.trim()}</span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Rates starting from</div>
                      <div className="fw-bold text-dark">₹{station.minPricePerKwh} / kWh</div>
                    </div>
                    <Link to={`/stations/${station.id}`} className="btn btn-sm btn-emerald text-decoration-none">
                      Reserve Slot
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Highlights & Tech Stack Banner */}
      <section className="py-5 bg-white border-top">
        <div className="container py-3">
          <div className="p-4 p-md-5 rounded-4" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: 'white' }}>
            <div className="row align-items-center gy-4">
              <div className="col-lg-8">
                <div className="badge bg-emerald text-white mb-3 px-3 py-1">Academic Viva & Presentation Ready</div>
                <h3 className="fw-bold text-white mb-3">Built Cleanly For Engineering Sem 3 Evaluation</h3>
                <p className="text-light text-opacity-75 mb-4">
                  Every layer—from Spring Boot Data JPA repositories, BCrypt JWT security, and double-booking conflict algorithms, to React state management and simulated live charging—is designed to be logically transparent and easy to explain during viva presentations.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={18} className="text-success" />
                    <span className="small">No Mock Frontend: Live REST API</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={18} className="text-success" />
                    <span className="small">PostgreSQL Transactional Relational DB</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={18} className="text-success" />
                    <span className="small">Role-Based (Customer, Operator, Admin)</span>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 text-lg-end">
                <Link to="/stations" className="btn btn-light btn-lg fw-bold px-4 py-3 rounded-3 text-dark text-decoration-none">
                  Launch Station Explorer ⚡
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
