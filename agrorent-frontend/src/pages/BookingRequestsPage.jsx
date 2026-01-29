import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../services/api';
import { Calendar, Phone, Check, X, Play, CheckCircle } from 'lucide-react';

const BookingRequestsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const response = await bookingApi.getRenterBookings();
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await bookingApi.approve(id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      await bookingApi.reject(id, reason);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleStart = async (id) => {
    try {
      await bookingApi.start(id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const handleComplete = async (id) => {
    try {
      await bookingApi.complete(id);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredBookings = filter === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (loading) {
    return (
      <div className="page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ marginBottom: '24px' }}>{t('booking.requestsTitle')}</h1>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED'].map((status) => (
            <button
              key={status}
              className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(status)}
            >
              {status === 'ALL' ? 'All' : t(`booking.status.${status}`)}
              <span style={{ marginLeft: '8px', opacity: 0.7 }}>
                ({status === 'ALL' ? bookings.length : bookings.filter(b => b.status === status).length})
              </span>
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>{t('booking.noRequests')}</h3>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div>
                  <h3 className="booking-equipment">{booking.equipmentName}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Requested by: {booking.rentTakerName}
                  </p>
                </div>
                <span className={`badge badge-${booking.status.toLowerCase()}`}>
                  {t(`booking.status.${booking.status}`)}
                </span>
              </div>

              <div className="booking-dates">
                <div>
                  <Calendar size={16} style={{ marginRight: '4px' }} />
                  {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                </div>
                <div>
                  <strong>₹{booking.totalCost?.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {(booking.status === 'APPROVED' || booking.status === 'ACTIVE') && (
                <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} />
                    <span>{t('booking.contact')}: {booking.rentTakerPhone}</span>
                  </div>
                </div>
              )}

              {booking.notes && (
                <p style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  "{booking.notes}"
                </p>
              )}

              <div className="booking-actions">
                {booking.status === 'PENDING' && (
                  <>
                    <button className="btn btn-primary btn-sm" onClick={() => handleApprove(booking.id)}>
                      <Check size={16} />
                      {t('booking.actions.approve')}
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleReject(booking.id)} style={{ color: 'var(--error)' }}>
                      <X size={16} />
                      {t('booking.actions.reject')}
                    </button>
                  </>
                )}
                {booking.status === 'APPROVED' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleStart(booking.id)}>
                    <Play size={16} />
                    {t('booking.actions.start')}
                  </button>
                )}
                {booking.status === 'ACTIVE' && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleComplete(booking.id)}>
                    <CheckCircle size={16} />
                    {t('booking.actions.complete')}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingRequestsPage;
