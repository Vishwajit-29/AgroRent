import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { bookingApi } from '../services/api';
import { Calendar, Phone, Star } from 'lucide-react';

const MyBookingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const response = await bookingApi.getMyBookings();
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingApi.cancel(id);
      fetchBookings();
    } catch (err) {
      console.error(err);
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
        <h1 style={{ marginBottom: '24px' }}>{t('booking.myBookingsTitle')}</h1>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>{t('booking.noBookings')}</h3>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <div>
                  <h3 className="booking-equipment">{booking.equipmentName}</h3>
                  <span className="equipment-category">{booking.equipmentCategory}</span>
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
                    <span>{t('booking.contact')}: {booking.renterName} - {booking.renterPhone}</span>
                  </div>
                </div>
              )}

              <div className="booking-actions">
                {booking.status === 'PENDING' && (
                  <button className="btn btn-outline btn-sm" onClick={() => handleCancel(booking.id)}>
                    {t('booking.actions.cancel')}
                  </button>
                )}
                {booking.status === 'COMPLETED' && !booking.ratingByRentTaker && (
                  <button className="btn btn-primary btn-sm">
                    <Star size={16} />
                    {t('booking.actions.rate')}
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

export default MyBookingsPage;
