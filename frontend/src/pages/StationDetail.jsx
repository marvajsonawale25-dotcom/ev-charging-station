import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, MapPin, Clock, Star, BatteryCharging, ShieldCheck, 
  Calendar, CheckCircle, AlertTriangle, AlertCircle, ArrowLeft,
  DollarSign, Car, Info, Send
} from 'lucide-react';
import ChargerBadge from '../components/ChargerBadge';

const StationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [station, setStation] = useState(null);
  const [chargers, setChargers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Form State
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    fetchStationDetails();
    if (isAuthenticated) {
      fetchUserVehicles();
    }
    // Set default start time to now + 5 mins formatted as YYYY-MM-DDTHH:mm
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    const isoString = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setStartTime(isoString);
  }, [id, isAuthenticated]);

  const fetchStationDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const stationRes = await api.get(`/stations/${id}`);
      const stData = stationRes.data;
      setStation(stData);

      // Chargers are in stData.chargers or fallback to /chargers/station/{id}
      let chargerList = stData.chargers || [];
      if (!chargerList.length) {
        try {
          const chgRes = await api.get(`/chargers/station/${id}`);
          chargerList = chgRes.data || [];
        } catch (e) {
          console.warn('Could not fetch chargers separately', e);
        }
      }
      setChargers(chargerList);

      // Auto-select first available charger
      const firstAvail = chargerList.find(c => c.status === 'AVAILABLE');
      if (firstAvail) setSelectedCharger(firstAvail);
      else if (chargerList.length > 0) setSelectedCharger(chargerList[0]);

      // Load reviews if available
      try {
        const revRes = await api.get(`/reviews/station/${id}`);
        setReviews(revRes.data || []);
      } catch (e) {
        setReviews([]);
      }
    } catch (err) {
      console.error('Error fetching station details:', err);
      setError('Unable to load station details. Please check the network connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVehicles = async () => {
    try {
      const res = await api.get('/vehicles/my');
      setVehicles(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedVehicleId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    }
  };

  const calculateEstimates = () => {
    if (!selectedCharger) return { kwh: 0, subtotal: 0, tax: 0, total: 0, rate: 0 };
    const power = selectedCharger.powerRatingKw || selectedCharger.powerKw || 30.0;
    const hours = durationMinutes / 60;
    const estimatedKwh = Math.round(power * hours * 0.9 * 10) / 10;
    const rate = selectedCharger.pricePerKwh || station?.minPricePerKwh || station?.pricePerKwh || 18.0;
    const subtotal = Math.round(estimatedKwh * rate);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;
    return { estimatedKwh, subtotal, tax, total, rate };
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setBookingError('');
    setBookingLoading(true);

    try {
      const start = new Date(startTime);
      const year = start.getFullYear();
      const month = String(start.getMonth() + 1).padStart(2, '0');
      const day = String(start.getDate()).padStart(2, '0');
      const hours = String(start.getHours()).padStart(2, '0');
      const minutes = String(start.getMinutes()).padStart(2, '0');
      const formattedStartTime = `${year}-${month}-${day}T${hours}:${minutes}:00`;

      const payload = {
        stationId: Number(station?.id || id),
        chargerId: Number(selectedCharger.id),
        vehicleId: selectedVehicleId ? Number(selectedVehicleId) : null,
        startTime: formattedStartTime,
        durationMinutes: Number(durationMinutes)
      };

      const res = await api.post('/bookings', payload);
      setBookingSuccess(res.data);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setBookingError('Slot Conflict: This charger is already reserved or in use during the selected time interval. Please pick another slot or charger port.');
      } else {
        setBookingError(err.response?.data?.message || 'Booking reservation failed. Please check inputs.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const res = await api.post('/reviews', {
        stationId: Number(id),
        rating: Number(rating),
        comment
      });
      setReviews([res.data, ...reviews]);
      setComment('');
      // refresh station
      const stationRes = await api.get(`/stations/${id}`);
      setStation(stationRes.data);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted">Loading station and charger ports...</p>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error || 'Station not found.'}</div>
        <Link to="/stations" className="btn btn-outline-secondary">
          <ArrowLeft size={16} className="me-1" /> Back to Stations
        </Link>
      </div>
    );
  }

  const estimates = calculateEstimates();
  const stationPrice = station.minPricePerKwh || station.pricePerKwh || 18.0;
  const stationRating = station.averageRating || station.rating || 4.5;
  const stationOperator = station.operatorName || station.operator?.name || 'VoltPoint Network';

  return (
    <div className="container py-4">
      {/* Breadcrumb & Title */}
      <div className="mb-4">
        <Link to="/stations" className="text-muted text-decoration-none small d-inline-flex align-items-center gap-1 mb-2 hover-text-primary">
          <ArrowLeft size={14} /> Back to all stations
        </Link>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className={`badge ${
                station.status === 'ACTIVE' 
                  ? 'bg-success bg-opacity-15 text-success' 
                  : 'bg-warning bg-opacity-15 text-warning'
              }`}>
                ● {station.status}
              </span>
              <span className="text-muted small">Station #{station.id}</span>
            </div>
            <h2 className="fw-bold mb-1">{station.name}</h2>
            <p className="text-muted small mb-0 d-flex align-items-center gap-1">
              <MapPin size={16} className="text-primary" />
              {station.address}, {station.city} {station.pincode ? `- ${station.pincode}` : ''}
            </p>
          </div>

          <div className="d-flex align-items-center gap-3 bg-dark border border-secondary p-3 rounded-3">
            <div className="text-center">
              <div className="text-warning fw-bold fs-4 d-flex align-items-center justify-content-center gap-1">
                <Star size={20} fill="#f59e0b" />
                {Number(stationRating).toFixed(1)}
              </div>
              <div className="text-muted extra-small">{reviews.length || station.reviewCount || 0} Reviews</div>
            </div>
            <div className="vr bg-secondary"></div>
            <div>
              <div className="text-muted extra-small">Standard Tariff</div>
              <div className="fs-4 fw-bold text-white">₹{stationPrice}<span className="fs-6 fw-normal text-muted">/kWh</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Station Info & Charger Selection */}
        <div className="col-12 col-lg-7">
          {/* Station Details Card */}
          <div className="card card-custom p-4 mb-4">
            <h5 className="fw-bold mb-3">Station Information</h5>
            <div className="row g-3 small">
              <div className="col-sm-6">
                <span className="text-muted d-block">Operating Hours</span>
                <span className="fw-semibold text-light">{station.operatingHours || '24 / 7 Accessible'}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted d-block">Operator In-Charge</span>
                <span className="fw-semibold text-light">{stationOperator}</span>
              </div>
              <div className="col-12">
                <span className="text-muted d-block">On-Site Amenities</span>
                <span className="fw-semibold text-light">{station.amenities || 'WiFi, Dedicated Parking, Washroom'}</span>
              </div>
            </div>
          </div>

          {/* Charger Ports */}
          <div className="card card-custom p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Select Charger Port</h5>
              <span className="text-muted small">{chargers.length} Ports Configured</span>
            </div>

            <div className="row g-3">
              {chargers.map((charger) => {
                const isSelected = selectedCharger?.id === charger.id;
                const isAvail = charger.status === 'AVAILABLE';
                const power = charger.powerRatingKw || charger.powerKw || 30;

                return (
                  <div key={charger.id} className="col-12 col-md-6">
                    <div
                      onClick={() => isAvail && setSelectedCharger(charger)}
                      className={`p-3 rounded-3 border transition-all ${
                        isSelected
                          ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                          : isAvail
                          ? 'border-secondary bg-dark hover-border cursor-pointer'
                          : 'border-secondary bg-dark opacity-50 cursor-not-allowed'
                      }`}
                      style={{ cursor: isAvail ? 'pointer' : 'not-allowed' }}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="fw-bold text-white fs-6">
                          {charger.identifier || `Port #${charger.id}`}
                        </span>
                        <ChargerBadge charger={charger} />
                      </div>

                      <div className="small text-muted mb-2">
                        <div>Type: <span className="text-light fw-medium">{charger.chargerType}</span></div>
                        <div>Connector: <span className="text-light fw-medium">{charger.connectorType}</span></div>
                        <div>Output: <span className="text-light fw-medium">{power} kW Fast Charge</span></div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center pt-2 border-top border-secondary small">
                        <span className="text-muted">Rate:</span>
                        <span className="fw-bold text-white">₹{charger.pricePerKwh}/kWh</span>
                      </div>

                      {isSelected && (
                        <div className="mt-2 text-primary small fw-semibold d-flex align-items-center gap-1">
                          <CheckCircle size={14} /> Selected for Booking
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="card card-custom p-4">
            <h5 className="fw-bold mb-3">Customer Reviews & Ratings</h5>

            {/* Write a review form */}
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="p-3 bg-dark rounded-3 border border-secondary mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold small text-light">Leave your feedback</span>
                  <div className="d-flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={18}
                        className="cursor-pointer"
                        fill={s <= rating ? '#f59e0b' : 'none'}
                        color="#f59e0b"
                        onClick={() => setRating(s)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </div>
                </div>

                {reviewError && (
                  <div className="alert alert-danger py-1 px-2 small mb-2">{reviewError}</div>
                )}

                <div className="mb-2">
                  <textarea
                    rows={2}
                    className="form-control form-control-custom small"
                    placeholder="Share your charging experience, charging speeds, amenities..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="text-end">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm btn-custom d-inline-flex align-items-center gap-1"
                    disabled={reviewSubmitting}
                  >
                    <Send size={14} />
                    {reviewSubmitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-muted small mb-4">
                Please <Link to="/login" className="text-primary">log in</Link> to submit a review for this station.
              </p>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <p className="text-muted small text-center py-3">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3 rounded-3 bg-dark border border-secondary">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold text-light small">{rev.user?.name || 'Verified EV Driver'}</span>
                      <div className="d-flex text-warning">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted small mb-1">{rev.comment}</p>
                    <span className="text-muted extra-small">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Reservation Wizard */}
        <div className="col-12 col-lg-5">
          <div className="card card-custom p-4 sticky-top" style={{ top: '90px' }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Calendar className="text-primary" size={20} />
              Reserve Charging Slot
            </h5>

            {/* Booking Success Modal Banner */}
            {bookingSuccess && (
              <div className="p-3 bg-success bg-opacity-10 border border-success rounded-3 mb-4 text-center">
                <CheckCircle size={36} className="text-success mb-2" />
                <h6 className="fw-bold text-success mb-1">Reservation Confirmed!</h6>
                <p className="small text-muted mb-2">
                  Booking #{bookingSuccess.id} on Port {bookingSuccess.charger?.identifier || selectedCharger?.identifier} is locked.
                </p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    className="btn btn-primary btn-sm btn-custom"
                    onClick={() => navigate('/bookings')}
                  >
                    View My Bookings
                  </button>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setBookingSuccess(null)}
                  >
                    Book Another
                  </button>
                </div>
              </div>
            )}

            {/* Booking Error Banner */}
            {bookingError && (
              <div className="alert alert-danger d-flex align-items-start gap-2 py-2 px-3 small rounded-3 mb-3">
                <AlertCircle size={18} className="flex-shrink-0 mt-1" />
                <div>{bookingError}</div>
              </div>
            )}

            {!bookingSuccess && (
              <form onSubmit={handleBookingSubmit}>
                {/* Selected Port preview */}
                <div className="p-3 bg-dark rounded-3 border border-secondary mb-3">
                  <span className="text-muted extra-small d-block">Selected Port</span>
                  {selectedCharger ? (
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <span className="fw-bold text-white">
                        {selectedCharger.identifier} ({selectedCharger.chargerType})
                      </span>
                      <span className="badge bg-primary">
                        {selectedCharger.powerRatingKw || selectedCharger.powerKw || 30} kW
                      </span>
                    </div>
                  ) : (
                    <span className="text-warning small">Please select an available charger port on the left.</span>
                  )}
                </div>

                {/* EV Vehicle Selection */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted d-flex justify-content-between">
                    <span>Electric Vehicle</span>
                    <Link to="/vehicles" className="text-primary text-decoration-none extra-small">
                      + Add Vehicle
                    </Link>
                  </label>
                  {vehicles.length > 0 ? (
                    <select
                      className="form-select form-control-custom"
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                    >
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.modelName || `${v.make || ''} ${v.model || ''}`} ({v.registrationNumber}) - {v.batteryCapacityKwh} kWh [{v.connectorType}]
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-muted small p-2 bg-dark rounded border border-secondary">
                      No EV registered. A default EV will be assigned automatically, or you can <Link to="/vehicles" className="text-primary">register one</Link>.
                    </div>
                  )}
                </div>

                {/* Slot Start Time */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Charging Start Time</label>
                  <input
                    type="datetime-local"
                    className="form-control form-control-custom"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>

                {/* Duration */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-muted d-flex justify-content-between">
                    <span>Duration: {durationMinutes} minutes</span>
                    <span className="text-muted">({(durationMinutes / 60).toFixed(1)} hrs)</span>
                  </label>
                  <input
                    type="range"
                    className="form-range"
                    min="15"
                    max="180"
                    step="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  />
                  <div className="d-flex justify-content-between extra-small text-muted">
                    <span>15 min</span>
                    <span>1 hr</span>
                    <span>2 hrs</span>
                    <span>3 hrs</span>
                  </div>
                </div>

                {/* Cost Estimation Breakdown */}
                <div className="p-3 bg-dark rounded-3 border border-secondary mb-4 small">
                  <div className="fw-semibold text-light mb-2">Cost & Energy Breakdown</div>
                  <div className="d-flex justify-content-between text-muted mb-1">
                    <span>Est. Energy</span>
                    <span className="text-light">{estimates.estimatedKwh} kWh</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted mb-1">
                    <span>Rate / kWh</span>
                    <span className="text-light">₹{estimates.rate}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted mb-1">
                    <span>Subtotal</span>
                    <span className="text-light">₹{estimates.subtotal}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted mb-2">
                    <span>GST (18%)</span>
                    <span className="text-light">₹{estimates.tax}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold text-white pt-2 border-top border-secondary fs-6">
                    <span>Est. Total</span>
                    <span className="text-primary">₹{estimates.total}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-custom w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                  disabled={!selectedCharger || selectedCharger.status !== 'AVAILABLE' || bookingLoading}
                >
                  {bookingLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Confirming Slot...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Confirm Reservation
                    </>
                  )}
                </button>

                <p className="text-muted extra-small text-center mt-2 mb-0">
                  ⚡ Guaranteed reservation. No advance deduction until charging begins.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationDetail;
