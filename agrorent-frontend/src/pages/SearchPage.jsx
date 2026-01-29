import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { equipmentApi } from '../services/api';
import EquipmentCard from '../components/equipment/EquipmentCard';
import CategoryGrid from '../components/common/CategoryGrid';
import { MapPin, Filter, Search as SearchIcon } from 'lucide-react';

const SearchPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    maxPrice: '',
    radiusKm: 50,
    sortBy: 'distance',
    latitude: null,
    longitude: null,
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilters(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        () => {
          // Default to center of India if location denied
          setFilters(prev => ({
            ...prev,
            latitude: 20.5937,
            longitude: 78.9629,
          }));
        }
      );
    }
  }, []);

  useEffect(() => {
    if (filters.latitude && filters.longitude) {
      fetchEquipment();
    }
  }, [filters.latitude, filters.longitude, filters.category, filters.sortBy]);

  const fetchEquipment = async () => {
    setLoading(true);
    setError('');

    try {
      const searchRequest = {
        latitude: filters.latitude,
        longitude: filters.longitude,
        radiusKm: filters.radiusKm,
        category: filters.category || null,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
        sortBy: filters.sortBy,
        sortOrder: 'asc',
      };

      const response = await equipmentApi.search(searchRequest);
      if (response.data.success) {
        setEquipment(response.data.data);
      }
    } catch (err) {
      setError('Failed to load equipment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setFilters({ ...filters, category: category || '' });
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
  };

  const handleSearch = () => {
    fetchEquipment();
  };

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ marginBottom: '24px' }}>{t('search.title')}</h1>

        {/* Categories */}
        <CategoryGrid 
          selectedCategory={filters.category}
          onSelect={handleCategorySelect}
        />

        {/* Filters Toggle */}
        <button
          className="btn btn-outline"
          onClick={() => setShowFilters(!showFilters)}
          style={{ marginBottom: '16px' }}
        >
          <Filter size={18} />
          {t('search.filters')}
        </button>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filters-panel">
            <div className="grid grid-3 form-row" style={{ gap: '16px', alignItems: 'end' }}>
              <div className="filter-group">
                <label className="form-label">{t('search.maxPrice')}</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="₹1000"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>

              <div className="filter-group">
                <label className="form-label">{t('search.radius')}</label>
                <select
                  className="form-select"
                  value={filters.radiusKm}
                  onChange={(e) => setFilters({ ...filters, radiusKm: parseInt(e.target.value) })}
                >
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="form-label">{t('search.sortBy')}</label>
                <select
                  className="form-select"
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                >
                  <option value="distance">{t('search.sortDistance')}</option>
                  <option value="price">{t('search.sortPrice')}</option>
                  <option value="rating">{t('search.sortRating')}</option>
                </select>
              </div>

              <button className="btn btn-primary" onClick={handleSearch} style={{ width: '100%' }}>
                <SearchIcon size={18} />
                {t('search.applyFilters')}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p>{error}</p>
          </div>
        ) : equipment.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>{t('equipment.noResults')}</h3>
          </div>
        ) : (
          <>
            <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
              {equipment.length} {t('search.results')}
            </p>
            <div className="grid grid-3">
              {equipment.map((item) => (
                <EquipmentCard key={item.id} equipment={item} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
