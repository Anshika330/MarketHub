import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { currentUser, logout } = useAuth();

  const closeMenu = () => setIsMenuOpen(false);
  const navigationLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
    ...(!currentUser || currentUser.role === 'Customer'
      ? [{ label: 'Cart', to: '/cart' }]
      : []),
    currentUser
      ? currentUser.role === 'Admin'
        ? { label: 'Admin', to: '/admin/dashboard' }
        : {
          label: currentUser.role === 'Vendor' ? 'Dashboard' : 'My Orders',
          to: currentUser.role === 'Vendor' ? '/vendor/dashboard' : '/orders',
          }
      : { label: 'Login', to: '/login' },
  ];

  return (
    <header className="site-header">
      <nav className="navbar container" aria-label="Main navigation">
        <NavLink className="brand" to="/" onClick={closeMenu}>
          Market<span>Hub</span>
        </NavLink>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          <span className="sr-only">Toggle navigation menu</span>
          <span />
          <span />
          <span />
        </button>

        <div
          id="primary-navigation"
          className={`nav-links${isMenuOpen ? ' nav-links--open' : ''}`}
        >
          {navigationLinks.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) =>
                `nav-link${isActive ? ' nav-link--active' : ''}`
              }
              to={link.to}
              end={link.to === '/'}
              onClick={closeMenu}
            >
              {link.label}
              {link.to === '/cart' && itemCount > 0 && (
                <span className="cart-count" aria-label={`${itemCount} items in cart`}>
                  {itemCount}
                </span>
              )}
            </NavLink>
          ))}
          {!currentUser ? (
            <NavLink
              className={({ isActive }) =>
                `nav-link nav-link--signup${isActive ? ' nav-link--active' : ''}`
              }
              to="/signup"
              onClick={closeMenu}
            >
              Sign up
            </NavLink>
          ) : (
            <div className="account-menu">
              <span className="account-summary">
                <strong>{currentUser.name}</strong>
                <small>{currentUser.role}</small>
              </span>
              <button
                className="logout-button"
                type="button"
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
