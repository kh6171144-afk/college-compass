import React, { useState, useEffect } from 'react';
import { GraduationCap, Sun, Moon, Menu, X } from 'lucide-react';

export default function Navbar({ currentPage, setCurrentPage, user, onLogout, onSignInClick }) {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'predictor', label: 'College Predictor' },
    { id: 'course', label: 'Course Predictor' },
    { id: 'compare', label: 'Compare' },
    { id: 'search', label: 'Search' },
    { id: 'admin', label: 'Admin Panel' },
    { id: 'about', label: 'About' },
  ];

  const visibleNavItems = navItems.filter(item => {
    if (item.id === 'admin') {
      return user && user.role === 'admin';
    }
    return true;
  });

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => handleNavClick('home')}>
          <GraduationCap size={32} />
          <span>College Compass</span>
        </div>

        {/* Desktop Links */}
        <div className="nav-links">
          {visibleNavItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
            >
              {item.label}
            </div>
          ))}
          
          <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme" style={{ marginRight: '5px' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '10px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Hi, <strong>{user.name.split(' ')[0]}</strong></span>
              <button className="btn btn-secondary" onClick={onLogout} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Logout</button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onSignInClick} style={{ padding: '6px 16px', fontSize: '0.85rem', marginLeft: '10px' }}>Sign In</button>
          )}
        </div>

        {/* Mobile controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} className="mobile-nav-toggle">
          <button className="btn-icon" onClick={toggleTheme} style={{ marginRight: '10px' }}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <button className="btn-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '70px',
            left: 0,
            width: '100%',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            zIndex: 99
          }}
        >
          {visibleNavItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
              style={{ padding: '10px 15px', width: '100%' }}
            >
              {item.label}
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px', paddingLeft: '15px' }}>
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Logged in as: <strong>{user.name}</strong></span>
                <button className="btn btn-secondary" onClick={() => { onLogout(); setMobileMenuOpen(false); }} style={{ width: '100%' }}>Logout</button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={() => { onSignInClick(); setMobileMenuOpen(false); }} style={{ width: '100%' }}>Sign In</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
