import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Tractor, CreditCard, RotateCcw } from 'lucide-react';
import CategoryGrid from '../components/common/CategoryGrid';

const HomePage = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>{t('home.title')}</h1>
          <p>{t('home.subtitle')}</p>
          <div className="hero-buttons">
            <Link to="/search" className="btn btn-secondary btn-lg">
              <Search size={20} />
              {t('home.searchButton')}
            </Link>
            {isAuthenticated ? (
              <Link to="/add-equipment" className="btn btn-outline btn-lg" style={{ borderColor: 'white', color: 'white' }}>
                <Plus size={20} />
                {t('home.listButton')}
              </Link>
            ) : (
              <Link to="/register" className="btn btn-outline btn-lg" style={{ borderColor: 'white', color: 'white' }}>
                <Plus size={20} />
                {t('home.listButton')}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container" style={{ marginTop: '40px' }}>
        <h2 style={{ marginBottom: '16px' }}>{t('equipment.category')}</h2>
        <CategoryGrid 
          onSelect={(cat) => {
            if (cat) {
              window.location.href = `/search?category=${cat}`;
            } else {
              window.location.href = '/search';
            }
          }}
          showAll={false}
        />
      </section>

      {/* How It Works */}
      <section className="container">
        <div className="how-it-works">
          <h2 style={{ textAlign: 'center' }}>{t('home.howItWorks')}</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">
                <Search size={28} />
              </div>
              <h3>{t('home.step1Title')}</h3>
              <p>{t('home.step1Desc')}</p>
            </div>
            <div className="step">
              <div className="step-number">
                <CreditCard size={28} />
              </div>
              <h3>{t('home.step2Title')}</h3>
              <p>{t('home.step2Desc')}</p>
            </div>
            <div className="step">
              <div className="step-number">
                <RotateCcw size={28} />
              </div>
              <h3>{t('home.step3Title')}</h3>
              <p>{t('home.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
