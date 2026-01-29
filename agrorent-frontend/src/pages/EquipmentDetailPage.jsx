import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { equipmentApi, bookingApi } from '../services/api';
import { getCategoryEmoji } from '../components/common/CategoryGrid';
import { MapPin, Star, Phone, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const EquipmentDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [equipment, setEquipment] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showBooking, setShowBooking] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      const response = await equipmentApi.getById(id);
      if (response.data.success) {
        setEquipment(response.data.data);
      }
    } catch (err) {
      setError('Equipment not found');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      const response = await bookingApi.create({
        equipmentId: id,
        startDate: new Date(bookingData.startDate).toISOString(),
        endDate: new Date(bookingData.endDate).toISOString(),
        notes: bookingData.notes,
      });

      if (response.data.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          navigate('/my-bookings');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
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

  if (error || !equipment) {
    return (
      <div className="page">
        <div className="container">
          <div className="empty-state">
            <h3>{error || 'Equipment not found'}</h3>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => `₹${price?.toLocaleString('en-IN')}`;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % equipment.images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? equipment.images.length - 1 : prev - 1));
  };

  return (
    <div className="page">
      <div className="container">
        <div className="grid grid-2 equipment-detail-layout" style={{ gap: '32px' }}>
          {/* Left: Equipment Details */}
          <div>
            {/* Image */}
            {/* Slideshow */}
            <div className="card" style={{ marginBottom: '24px', overflow: 'hidden' }}>
              <div className="slideshow-container">
                {equipment.images?.length > 0 ? (
                  <>
                    <div className="main-image-container">
                      <img 
                        src={equipment.images[currentImageIndex]} 
                        alt={`${equipment.name} ${currentImageIndex + 1}`} 
                        className="slideshow-image"
                      />
                      
                      {equipment.images.length > 1 && (
                        <>
                          <button className="slide-btn prev" onClick={prevImage}>
                            <ChevronLeft size={24} />
                          </button>
                          <button className="slide-btn next" onClick={nextImage}>
                            <ChevronRight size={24} />
                          </button>
                        </>
                      )}
                    </div>

                    {equipment.images.length > 1 && (
                      <div className="thumbnail-strip">
                        {equipment.images.map((img, index) => (
                          <div 
                            key={index} 
                            className={`thumbnail-item ${index === currentImageIndex ? 'active' : ''}`}
                            onClick={() => setCurrentImageIndex(index)}
                          >
                            <img src={img} alt={`Thumbnail ${index + 1}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="equipment-image" style={{ height: '300px' }}>
                    <span style={{ fontSize: '96px' }}>{getCategoryEmoji(equipment.category)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="card">
              <div className="card-body">
                <span className="equipment-category">{t(`categories.${equipment.category}`)}</span>
                <h1 style={{ marginBottom: '16px' }}>{equipment.name}</h1>
                
                {equipment.description && (
                  <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
                    {equipment.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  <div className="equipment-location">
                    <MapPin size={18} />
                    <span>{equipment.village || equipment.district}, {equipment.state}</span>
                  </div>
                  {equipment.rating > 0 && (
                    <div className="equipment-rating">
                      <Star size={18} fill="currentColor" />
                      <span>{equipment.rating.toFixed(1)} ({equipment.totalRatings} reviews)</span>
                    </div>
                  )}
                </div>

                {/* Owner Info */}
                <div style={{ padding: '16px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ marginBottom: '8px' }}>Equipment Owner</h3>
                  <p>{equipment.ownerName}</p>
                  {equipment.available && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <Phone size={16} />
                      <span>{equipment.ownerPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pricing & Booking */}
          <div>
            <div className="card sticky-card" style={{ position: 'sticky', top: '90px' }}>
              <div className="card-body">
                <h2 style={{ marginBottom: '16px' }}>Pricing</h2>
                
                <div style={{ marginBottom: '24px' }}>
                  {equipment.pricePerHour && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Per Hour</span>
                      <strong style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>
                        {formatPrice(equipment.pricePerHour)}
                      </strong>
                    </div>
                  )}
                  {equipment.pricePerDay && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Per Day</span>
                      <strong style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>
                        {formatPrice(equipment.pricePerDay)}
                      </strong>
                    </div>
                  )}
                  {equipment.pricePerWeek && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Per Week</span>
                      <strong style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>
                        {formatPrice(equipment.pricePerWeek)}
                      </strong>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <span className={`badge ${equipment.available ? 'badge-available' : 'badge-unavailable'}`}>
                    {equipment.available ? t('equipment.available') : t('equipment.unavailable')}
                  </span>
                </div>

                {equipment.available && isAuthenticated && (user?.id !== equipment.ownerId) && !showBooking && (
                  <button 
                    className="btn btn-primary btn-lg" 
                    style={{ width: '100%' }}
                    onClick={() => setShowBooking(true)}
                  >
                    <Calendar size={20} />
                    {t('equipment.rentNow')}
                  </button>
                )}

                {!isAuthenticated && (
                  <button 
                    className="btn btn-primary btn-lg" 
                    style={{ width: '100%' }}
                    onClick={() => navigate('/login')}
                  >
                    Login to Book
                  </button>
                )}

                {/* Booking Form */}
                {showBooking && !bookingSuccess && (
                  <form onSubmit={handleBooking}>
                    <h3 style={{ marginBottom: '16px' }}>{t('booking.createTitle')}</h3>
                    
                    <div className="form-group">
                      <label className="form-label">
                        <Calendar size={16} style={{ display: 'inline', marginRight: '8px' }} />
                        {t('booking.startDate')}
                      </label>
                      <input
                        type="datetime-local"
                        className="form-input"
                        value={bookingData.startDate}
                        onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <Clock size={16} style={{ display: 'inline', marginRight: '8px' }} />
                        {t('booking.endDate')}
                      </label>
                      <input
                        type="datetime-local"
                        className="form-input"
                        value={bookingData.endDate}
                        onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t('booking.notes')}</label>
                      <textarea
                        className="form-input"
                        rows={3}
                        placeholder={t('booking.notesPlaceholder')}
                        value={bookingData.notes}
                        onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                      ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setShowBooking(false)}
                      >
                        {t('booking.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={bookingLoading}
                        style={{ flex: 1 }}
                      >
                        {bookingLoading ? 'Submitting...' : t('booking.submit')}
                      </button>
                    </div>
                  </form>
                )}

                {bookingSuccess && (
                  <div className="badge badge-active" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
                    ✅ Booking request submitted! Redirecting...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetailPage;
