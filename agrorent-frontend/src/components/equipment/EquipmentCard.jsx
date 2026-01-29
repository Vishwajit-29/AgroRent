import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Star, User } from 'lucide-react';
import { getCategoryEmoji } from '../common/CategoryGrid';

const EquipmentCard = ({ equipment }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const isOwner = user && equipment.ownerId === user.id;

  const formatPrice = (price) => {
    if (!price) return null;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const displayPrice = equipment.pricePerDay || equipment.pricePerHour;
  const priceLabel = equipment.pricePerDay ? t('equipment.perDay') : t('equipment.perHour');

  return (
    <Link 
      to={isOwner ? '#' : `/equipment/${equipment.id}`} 
      className={`card equipment-card ${isOwner ? 'is-owner' : ''}`}
      style={{ pointerEvents: isOwner ? 'none' : 'auto', cursor: isOwner ? 'default' : 'pointer' }}
    >
      <div className="equipment-image">
        {equipment.images && equipment.images.length > 0 ? (
          <img src={equipment.images[0]} alt={equipment.name} />
        ) : (
          <span style={{ fontSize: '64px' }}>{getCategoryEmoji(equipment.category)}</span>
        )}
        {isOwner && (
          <div className="owner-badge">
            <User size={12} />
            {t('equipment.myListing') || 'My Listing'}
          </div>
        )}
      </div>
      
      <div className="equipment-details">
        <span className="equipment-category">
          {t(`categories.${equipment.category}`)}
        </span>
        
        <h3 className="equipment-name">{equipment.name}</h3>
        
        <div className="equipment-location">
          <MapPin size={14} />
          {equipment.distanceKm ? (
            <span>{equipment.distanceKm} {t('equipment.kmAway')}</span>
          ) : (
            <span>{equipment.village || equipment.district}</span>
          )}
        </div>

        <div className="equipment-footer">
          <div className="equipment-price">
            {formatPrice(displayPrice)}
            <span> {priceLabel}</span>
          </div>

          {equipment.rating > 0 && (
            <div className="equipment-rating">
              <Star size={16} fill="currentColor" />
              <span>{equipment.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EquipmentCard;
