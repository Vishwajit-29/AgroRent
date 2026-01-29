import { useTranslation } from 'react-i18next';
import { 
  Tractor, 
  Scissors, 
  Shovel, 
  Sprout,
  Droplets,
  Truck,
  Wheat,
  Settings,
  CircleDot
} from 'lucide-react';

const categoryIcons = {
  TRACTOR: Tractor,
  HARVESTER: Scissors,
  TILLER: Shovel,
  CULTIVATOR: Sprout,
  SEEDER: CircleDot,
  SPRAYER: Droplets,
  PUMP: Droplets,
  TRAILER: Truck,
  THRESHER: Wheat,
  PLOUGH: Shovel,
  ROTAVATOR: Settings,
  OTHER: Settings,
};

const categoryEmojis = {
  TRACTOR: '🚜',
  HARVESTER: '🌾',
  TILLER: '🔧',
  CULTIVATOR: '🌱',
  SEEDER: '🌰',
  SPRAYER: '💧',
  PUMP: '💧',
  TRAILER: '🚛',
  THRESHER: '🌾',
  PLOUGH: '⚙️',
  ROTAVATOR: '⚙️',
  OTHER: '🔧',
};

const CategoryGrid = ({ selectedCategory, onSelect, showAll = true }) => {
  const { t } = useTranslation();

  const categories = [
    'TRACTOR', 'HARVESTER', 'TILLER', 'CULTIVATOR', 
    'SEEDER', 'SPRAYER', 'PUMP', 'TRAILER', 
    'THRESHER', 'PLOUGH', 'ROTAVATOR', 'OTHER'
  ];

  return (
    <div className="category-grid">
      {showAll && (
        <div
          className={`category-item ${!selectedCategory ? 'active' : ''}`}
          onClick={() => onSelect(null)}
        >
          <div className="category-icon">📦</div>
          <span className="category-name">{t('search.allCategories')}</span>
        </div>
      )}
      {categories.map((cat) => (
        <div
          key={cat}
          className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          <div className="category-icon">{categoryEmojis[cat]}</div>
          <span className="category-name">{t(`categories.${cat}`)}</span>
        </div>
      ))}
    </div>
  );
};

export const getCategoryIcon = (category) => {
  const Icon = categoryIcons[category] || Settings;
  return <Icon size={24} />;
};

export const getCategoryEmoji = (category) => {
  return categoryEmojis[category] || '🔧';
};

export default CategoryGrid;
