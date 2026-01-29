import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { equipmentApi } from '../services/api';
import { MapPin, Save, Image, Plus } from 'lucide-react';

const categories = [
  'TRACTOR', 'HARVESTER', 'TILLER', 'CULTIVATOR', 
  'SEEDER', 'SPRAYER', 'PUMP', 'TRAILER', 
  'THRESHER', 'PLOUGH', 'ROTAVATOR', 'OTHER'
];

const AddEquipmentPage = () => {
  const { t } = useTranslation();
  const { id } = useParams(); // For edit mode
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'TRACTOR',
    pricePerHour: '',
    pricePerDay: '',
    pricePerWeek: '',
    latitude: user?.latitude || null,
    longitude: user?.longitude || null,
    address: user?.address || '',
    village: user?.village || '',
    district: user?.district || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (id) {
      fetchEquipment();
    }
  }, [id, isAuthenticated]);

  const fetchEquipment = async () => {
    try {
      const response = await equipmentApi.getById(id);
      if (response.data.success) {
        const eq = response.data.data;
        setFormData({
          name: eq.name,
          description: eq.description || '',
          category: eq.category,
          pricePerHour: eq.pricePerHour || '',
          pricePerDay: eq.pricePerDay || '',
          pricePerWeek: eq.pricePerWeek || '',
          latitude: eq.latitude,
          longitude: eq.longitude,
          address: eq.address || '',
          village: eq.village || '',
          district: eq.district || '',
          state: eq.state || '',
          pincode: eq.pincode || '',
          images: eq.images || [],
        });
      }
    } catch (err) {
      setError('Equipment not found');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
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
      () => {
        setError('Could not detect location');
        setLocationLoading(false);
      }
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.latitude || !formData.longitude) {
      setError('Please detect or enter your location');
      return;
    }

    if (!formData.pricePerHour && !formData.pricePerDay && !formData.pricePerWeek) {
      setError('Please enter at least one price');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : null,
        pricePerDay: formData.pricePerDay ? parseFloat(formData.pricePerDay) : null,
        pricePerWeek: formData.pricePerWeek ? parseFloat(formData.pricePerWeek) : null,
      };

      const response = id
        ? await equipmentApi.update(id, payload)
        : await equipmentApi.create(payload);

      if (response.data.success) {
        navigate('/my-equipment');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save equipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ marginBottom: '24px' }}>
          {id ? t('equipment.editTitle') : t('equipment.addTitle')}
        </h1>

        <form onSubmit={handleSubmit} className="card" style={{ padding: '32px' }}>
          {error && (
            <div className="badge badge-rejected" style={{ width: '100%', marginBottom: '24px', justifyContent: 'center', padding: '12px' }}>
              {error}
            </div>
          )}

          <div className="grid grid-2" style={{ gap: '24px' }}>
            <div className="form-group">
              <label className="form-label">{t('equipment.name')}</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder={t('equipment.namePlaceholder')}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('equipment.category')}</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{t(`categories.${cat}`)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('equipment.description')}</label>
            <textarea
              name="description"
              className="form-input"
              rows="4"
              placeholder={t('equipment.descriptionPlaceholder')}
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">
              <Image size={16} style={{ display: 'inline', marginRight: '8px' }} />
              {t('equipment.images')}
            </label>
            <div className="image-upload-container">
              <div className="image-preview-grid">
                {formData.images.map((img, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={img} alt="Preview" />
                    <button 
                      type="button" 
                      className="remove-image" 
                      onClick={() => removeImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <label className="image-upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <Plus size={24} />
                  <span>{t('common.add')}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <h3 style={{ margin: '24px 0 16px' }}>Pricing</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label">{t('equipment.pricePerHour')}</label>
              <input
                type="number"
                name="pricePerHour"
                className="form-input"
                placeholder="₹500"
                value={formData.pricePerHour}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('equipment.pricePerDay')}</label>
              <input
                type="number"
                name="pricePerDay"
                className="form-input"
                placeholder="₹2000"
                value={formData.pricePerDay}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('equipment.pricePerWeek')}</label>
              <input
                type="number"
                name="pricePerWeek"
                className="form-input"
                placeholder="₹10000"
                value={formData.pricePerWeek}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Location */}
          <h3 style={{ marginBottom: '16px' }}>{t('equipment.location')}</h3>
          <button 
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', marginBottom: '16px' }}
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
            <div style={{ fontSize: '0.875rem', color: 'var(--success)', marginBottom: '16px' }}>
              📍 Location: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
            </div>
          )}

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
            style={{ width: '100%', marginTop: '16px' }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" style={{ width: '20px', height: '20px' }}></span>
            ) : (
              <>
                <Save size={20} />
                {t('equipment.save')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddEquipmentPage;
