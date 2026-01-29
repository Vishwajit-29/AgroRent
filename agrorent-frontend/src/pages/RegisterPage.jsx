import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, User, MapPin, Tractor } from 'lucide-react';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    latitude: null,
    longitude: null,
    address: '',
    district: '',
    state: '',
    pincode: '',
    preferredLanguage: localStorage.getItem('language') || 'hi',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      (err) => {
        setError('Could not detect location');
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/search');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <div className="logo-icon">
              <Tractor size={24} />
            </div>
            <span>AgroRent</span>
          </div>
          <h1>{t('auth.registerTitle')}</h1>
          <p>{t('auth.registerSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="badge badge-rejected" style={{ width: '100%', marginBottom: '16px', justifyContent: 'center', padding: '12px' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              <User size={16} style={{ display: 'inline', marginRight: '8px' }} />
              {t('auth.name')}
            </label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder={t('auth.namePlaceholder')}
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Phone size={16} style={{ display: 'inline', marginRight: '8px' }} />
              {t('auth.phone')}
            </label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder={t('auth.phonePlaceholder')}
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} style={{ display: 'inline', marginRight: '8px' }} />
              {t('auth.password')}
            </label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder={t('auth.passwordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              minLength={4}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} style={{ display: 'inline', marginRight: '8px' }} />
              {t('auth.confirmPassword')}
            </label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder={t('auth.passwordPlaceholder')}
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={4}
              required
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">
              <MapPin size={16} style={{ display: 'inline', marginRight: '8px' }} />
              {t('auth.location')}
            </label>
            <button 
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', marginBottom: '12px' }}
              onClick={detectLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <span className="spinner" style={{ width: '20px', height: '20px' }}></span>
              ) : (
                <>
                  <MapPin size={18} />
                  {t('auth.detectLocation')}
                </>
              )}
            </button>
            {formData.latitude && (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                📍 Location detected: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">{t('auth.district')}</label>
              <input
                type="text"
                name="district"
                className="form-input"
                value={formData.district}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.state')}</label>
              <input
                type="text"
                name="state"
                className="form-input"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" style={{ width: '20px', height: '20px' }}></span>
            ) : (
              t('auth.registerButton')
            )}
          </button>
        </form>

        <div className="auth-footer">
          {t('auth.hasAccount')} <Link to="/login">{t('nav.login')}</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
