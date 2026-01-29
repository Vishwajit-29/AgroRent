import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { equipmentApi } from '../services/api';
import { getCategoryEmoji } from '../components/common/CategoryGrid';
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const MyEquipmentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchEquipment();
  }, [isAuthenticated]);

  const fetchEquipment = async () => {
    try {
      const response = await equipmentApi.getMyEquipment();
      if (response.data.success) {
        setEquipment(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      const response = await equipmentApi.toggleAvailability(id);
      if (response.data.success) {
        setEquipment(equipment.map(eq => 
          eq.id === id ? { ...eq, available: response.data.data.available } : eq
        ));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    
    try {
      await equipmentApi.deleteEquipment(id);
      setEquipment(equipment.filter(eq => eq.id !== id));
    } catch (err) {
      console.error(err);
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

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <h1>{t('equipment.myEquipmentTitle')}</h1>
          <Link to="/add-equipment" className="btn btn-primary">
            <Plus size={20} />
            {t('nav.addEquipment')}
          </Link>
        </div>

        {equipment.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>{t('equipment.noEquipment')}</h3>
            <Link to="/add-equipment" className="btn btn-primary" style={{ marginTop: '16px' }}>
              <Plus size={20} />
              {t('nav.addEquipment')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-3">
            {equipment.map((item) => (
              <div key={item.id} className="card">
                <div className="equipment-image" style={{ height: '150px' }}>
                  {item.images?.length > 0 ? (
                    <img src={item.images[0]} alt={item.name} />
                  ) : (
                    <span style={{ fontSize: '48px' }}>{getCategoryEmoji(item.category)}</span>
                  )}
                </div>
                <div className="card-body">
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <span className="equipment-category">{t(`categories.${item.category}`)}</span>
                    <span className={`badge ${item.available ? 'badge-available' : 'badge-unavailable'}`}>
                      {item.available ? t('equipment.available') : t('equipment.unavailable')}
                    </span>
                  </div>
                  <h3 className="equipment-name">{item.name}</h3>
                  <div className="equipment-price" style={{ marginBottom: '16px' }}>
                    ₹{item.pricePerDay?.toLocaleString('en-IN')}
                    <span> {t('equipment.perDay')}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleToggleAvailability(item.id)}
                      title={item.available ? 'Mark Unavailable' : 'Mark Available'}
                    >
                      {item.available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    </button>
                    <Link to={`/edit-equipment/${item.id}`} className="btn btn-outline btn-sm">
                      <Edit size={18} />
                    </Link>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDelete(item.id)}
                      style={{ color: 'var(--error)' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEquipmentPage;
