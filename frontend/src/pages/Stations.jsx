import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { 
  Zap, MapPin, Search, Filter, Clock, Star, 
  BatteryCharging, ChevronRight, RefreshCw, AlertCircle 
} from 'lucide-react';
import ChargerBadge from '../components/ChargerBadge';

const Stations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states initialized from URL query if present
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [chargerType, setChargerType] = useState(searchParams.get('chargerType') || '');

  const fetchStations = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (city.trim()) params.city = city.trim();
      if (chargerType.trim()) params.chargerType = chargerType.trim();

      const res = await api.get('/stations', { params });
      setStations(res.data);
    } catch (err) {
      setError('Unable to load charging stations. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [city, chargerType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStations();
  };

  const handleReset = () => {
    setSearch('');
    setCity('');
    setChargerType('');
    setSearchParams({});
    api.get('/stations').then(res => setStations(res.data));
  };

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 d-flex align-items-center gap-2">
            <Zap className="text-primary" size={28} />
            Explore Charging Stations
          </h2>
          <p className="text-muted small mb-0">
            Real-time availability, dynamic pricing, and instant slot reservations across Mumbai & Navi Mumbai
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button 
            className="btn btn-dark border-secondary btn-sm d-flex align-items-center gap-2"
            onClick={fetchStations}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card card-custom p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control form-control-custom"
                placeholder="Search by station name, locality or landmark..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-control-custom"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">All Cities</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Navi Mumbai">Navi Mumbai</option>
              <option value="Thane">Thane</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-control-custom"
              value={chargerType}
              onChange={(e) => setChargerType(e.target.value)}
            >
              <option value="">All Speeds</option>
              <option value="DC_FAST">DC Fast (50kW+)</option>
              <option value="AC_SLOW">AC Standard (7.4-22kW)</option>
            </select>
          </div>

          <div className="col-12 col-md-2 d-flex gap-2">
            <button type="submit" className="btn btn-primary btn-custom flex-grow-1">
              Search
            </button>
            {(search || city || chargerType) && (
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-custom"
                onClick={handleReset}
                title="Reset filters"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-3 rounded-3 mb-4">
          <AlertCircle size={20} />
          <div>{error}</div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading stations...</span>
          </div>
          <p className="text-muted small">Fetching nearby charging stations...</p>
        </div>
      )}

      {/* Stations Grid */}
      {!loading && stations.length > 0 && (
        <div className="row g-4">
          {stations.map((station) => {
            const availableCount = station.chargers 
              ? station.chargers.filter(c => c.status === 'AVAILABLE').length 
              : 0;
            const totalCount = station.chargers ? station.chargers.length : 0;

            return (
              <div key={station.id} className="col-12 col-md-6 col-lg-4">
                <div className="card card-custom h-100 d-flex flex-column justify-content-between p-4">
                  <div>
                    {/* Top row: Status & Rating */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className={`badge ${
                        station.status === 'ACTIVE' 
                          ? 'bg-success bg-opacity-15 text-success' 
                          : 'bg-warning bg-opacity-15 text-warning'
                      }`}>
                        ● {station.status}
                      </span>
                      <div className="d-flex align-items-center gap-1 text-warning small fw-bold">
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                        <span>{station.rating ? station.rating.toFixed(1) : '4.5'}</span>
                        <span className="text-muted fw-normal">({station.reviewCount || 12})</span>
                      </div>
                    </div>

                    {/* Station Name */}
                    <h5 className="fw-bold mb-1 text-white">{station.name}</h5>

                    {/* Address & City */}
                    <p className="text-muted small d-flex align-items-start gap-1 mb-3">
                      <MapPin size={16} className="text-primary flex-shrink-0 mt-1" />
                      <span>{station.address}, {station.city} - {station.pincode}</span>
                    </p>

                    {/* Operating hours */}
                    <div className="d-flex align-items-center gap-2 text-muted small mb-3">
                      <Clock size={14} />
                      <span>{station.operatingHours || '24 / 7 Accessible'}</span>
                    </div>

                    {/* Charger Ports summary */}
                    <div className="p-2 rounded-3 bg-dark border border-secondary mb-3">
                      <div className="d-flex justify-content-between align-items-center small mb-2">
                        <span className="text-muted d-flex align-items-center gap-1">
                          <BatteryCharging size={14} className="text-primary" />
                          Available Ports:
                        </span>
                        <span className={`fw-bold ${availableCount > 0 ? 'text-success' : 'text-danger'}`}>
                          {availableCount} / {totalCount} Available
                        </span>
                      </div>
                      <div className="d-flex flex-wrap gap-1">
                        {station.chargers && station.chargers.slice(0, 3).map((charger) => (
                          <ChargerBadge key={charger.id} charger={charger} />
                        ))}
                        {station.chargers && station.chargers.length > 3 && (
                          <span className="badge bg-secondary text-white">
                            +{station.chargers.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amenities */}
                    {station.amenities && (
                      <div className="small text-muted mb-3">
                        <span className="fw-semibold text-light">Amenities: </span>
                        {station.amenities}
                      </div>
                    )}
                  </div>

                  {/* Bottom row: Pricing & Book CTA */}
                  <div className="pt-3 border-top border-secondary d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-muted extra-small">Base Tariff</div>
                      <div className="fw-bold fs-5 text-white">
                        ₹{station.pricePerKwh}
                        <span className="text-muted fs-6 fw-normal">/kWh</span>
                      </div>
                    </div>

                    <Link
                      to={`/stations/${station.id}`}
                      className="btn btn-primary btn-custom d-flex align-items-center gap-1"
                    >
                      Book Slot <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No results */}
      {!loading && stations.length === 0 && (
        <div className="card card-custom p-5 text-center">
          <div className="d-inline-flex p-3 bg-secondary bg-opacity-20 text-muted rounded-circle mb-3 mx-auto">
            <Zap size={36} />
          </div>
          <h4 className="fw-bold mb-1">No charging stations found</h4>
          <p className="text-muted small mb-4">
            Try adjusting your search criteria or resetting filters to view all stations.
          </p>
          <div>
            <button className="btn btn-primary btn-custom" onClick={handleReset}>
              View All Stations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stations;
