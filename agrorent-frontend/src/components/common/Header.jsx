import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import { 
  Home, 
  Search, 
  Package, 
  Calendar, 
  Plus, 
  LogIn, 
  LogOut,
  User,
  Tractor,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';

import logo from '../../assets/logo.png';

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo" onClick={closeMenu}>
          <img src={logo} alt="AgroRent Logo" style={{ height: '100px', transition: 'height 0.2s' }} />
        </Link>

        {/* Desktop Nav - Hidden on mobile */}
        <nav className="nav desktop-nav">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <Home size={18} />
            {t('nav.home')}
          </Link>

          <Link 
            to="/search" 
            className={`nav-link ${isActive('/search') ? 'active' : ''}`}
          >
            <Search size={18} />
            {t('nav.search')}
          </Link>

          {isAuthenticated && (
            <>
              <Link 
                to="/my-equipment" 
                className={`nav-link ${isActive('/my-equipment') ? 'active' : ''}`}
              >
                <Package size={18} />
                {t('nav.myEquipment')}
              </Link>
              <Link 
                to="/my-bookings" 
                className={`nav-link ${isActive('/my-bookings') ? 'active' : ''}`}
              >
                <Calendar size={18} />
                {t('nav.myBookings')}
              </Link>
              <Link 
                to="/requests" 
                className={`nav-link ${isActive('/requests') ? 'active' : ''}`}
              >
                <ClipboardList size={18} />
                {t('nav.requests')}
              </Link>
              <Link 
                to="/add-equipment" 
                className={`nav-link ${isActive('/add-equipment') ? 'active' : ''}`}
              >
                <Plus size={18} />
                {t('nav.addEquipment')}
              </Link>
            </>
          )}
        </nav>

        <div className="flex gap-1 header-actions">
          <div className="desktop-nav flex gap-1 items-center">
            <LanguageSwitcher />

            {isAuthenticated ? (
              <>
                <Link to="/profile" className="nav-link">
                  <User size={18} />
                  {user?.name?.split(' ')[0]}
                </Link>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  <LogOut size={18} />
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">
                  <LogIn size={18} />
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {isMenuOpen && <div className="mobile-backdrop" onClick={closeMenu}></div>}

      {/* Mobile Menu Drawer */}
      <div className={`mobile-nav-drawer ${isMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <LanguageSwitcher />
          <button className="close-btn" onClick={closeMenu}><X size={24} /></button>
        </div>

        <nav className="mobile-links">
          <Link to="/" className={`mobile-link ${isActive('/') ? 'active' : ''}`} onClick={closeMenu}>
            <Home size={20} /> {t('nav.home')}
          </Link>
          <Link to="/search" className={`mobile-link ${isActive('/search') ? 'active' : ''}`} onClick={closeMenu}>
            <Search size={20} /> {t('nav.search')}
          </Link>

          {isAuthenticated ? (
            <>
              <hr />
              <Link to="/my-equipment" className={`mobile-link ${isActive('/my-equipment') ? 'active' : ''}`} onClick={closeMenu}>
                <Package size={20} /> {t('nav.myEquipment')}
              </Link>
              <Link to="/my-bookings" className={`mobile-link ${isActive('/my-bookings') ? 'active' : ''}`} onClick={closeMenu}>
                <Calendar size={20} /> {t('nav.myBookings')}
              </Link>
              <Link to="/requests" className={`mobile-link ${isActive('/requests') ? 'active' : ''}`} onClick={closeMenu}>
                <ClipboardList size={20} /> {t('nav.requests')}
              </Link>
              <Link to="/add-equipment" className={`mobile-link ${isActive('/add-equipment') ? 'active' : ''}`} onClick={closeMenu}>
                <Plus size={20} /> {t('nav.addEquipment')}
              </Link>
              <hr />
              <Link to="/profile" className="mobile-link" onClick={closeMenu}>
                <User size={20} /> {user?.name}
              </Link>
              <button onClick={handleLogout} className="mobile-link logout-btn">
                <LogOut size={20} /> {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <hr />
              <Link to="/login" className="mobile-link" onClick={closeMenu}>
                <LogIn size={20} /> {t('nav.login')}
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ margin: '16px 24px' }} onClick={closeMenu}>
                {t('nav.register')}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
