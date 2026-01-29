import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, LogIn, Tractor } from 'lucide-react';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.phone, formData.password);
      if (result.success) {
        navigate(result.user.role === 'RENTER' ? '/my-equipment' : '/search');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid phone number or password');
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
          <h1>{t('auth.loginTitle')}</h1>
          <p>{t('auth.loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="badge badge-rejected" style={{ width: '100%', marginBottom: '16px', justifyContent: 'center', padding: '12px' }}>
              {error}
            </div>
          )}

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
              required
            />
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
              <>
                <LogIn size={20} />
                {t('auth.loginButton')}
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          {t('auth.noAccount')} <Link to="/register">{t('nav.register')}</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
