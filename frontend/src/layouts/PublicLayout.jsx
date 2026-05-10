import React, { useContext, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiSun, FiMoon, FiSearch } from 'react-icons/fi';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/public.css';

const PublicLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <div className="public-wrapper">
      <nav className="public-navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            Ink<span>well</span>.
          </Link>

          <div className="navbar-menu">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="/blog" className={`nav-link ${location.pathname.startsWith('/blog') ? 'active' : ''}`}>Blog</Link>
          </div>

          <div className="navbar-actions">
            <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">
              {document.documentElement.getAttribute('data-theme') === 'dark' ? <FiSun /> : <FiMoon />}
            </button>
            {user ? (
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link to="/admin/dashboard" className="nav-link" style={{ fontSize: '0.875rem' }}>Dashboard</Link>
                <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.4rem 1rem' }}>Logout</button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding: '0.4rem 1.2rem' }}>Sign In</Link>
            )}
          </div>
        </div>
      </nav>

      <main className="public-main" style={{ minHeight: 'calc(100vh - 70px - 200px)' }}>
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">Ink<span>well</span>.</div>
              <p className="footer-desc">
                A modern platform for thinkers, writers, and visionaries to share their ideas with the world through beautiful typography and elegant design.
              </p>
            </div>
            <div>
              <div className="footer-title">Explore</div>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/blog">Latest Articles</Link></li>
                <li><Link to="/login">Writers Portal</Link></li>
              </ul>
            </div>
            <div>
              <div className="footer-title">Connect</div>
              <ul className="footer-links">
                <li><a href="#">Twitter</a></li>
                <li><a href="#">GitHub</a></li>
                <li><a href="#">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div>&copy; {new Date().getFullYear()} Inkwell CMS. All rights reserved.</div>
            <div>Built with React & Laravel</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
