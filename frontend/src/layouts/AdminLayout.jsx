import React, { useState, useContext, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
  FiHome, FiFileText, FiFolder, FiTag, 
  FiMessageSquare, FiSettings, FiMenu, FiX, 
  FiMoon, FiSun, FiLogOut 
} from 'react-icons/fi';
import '../styles/admin.css';

const AdminLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Initialize theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/admin/posts', icon: <FiFileText />, label: 'Posts' },
    { path: '/admin/categories', icon: <FiFolder />, label: 'Categories' },
    { path: '/admin/tags', icon: <FiTag />, label: 'Tags' },
    { path: '/admin/comments', icon: <FiMessageSquare />, label: 'Comments' },
    { path: '/admin/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="admin-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span style={{ fontSize: '1.75rem' }}>✍️</span> Inkwell
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navLinks.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          
          <div className="topbar-right">
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </button>
            
            <div className="user-profile">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-role">{user?.role || 'Author'}</span>
              </div>
            </div>
            
            <button className="logout-btn" onClick={handleLogout}>
              <FiLogOut /> <span className="hide-mobile">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
