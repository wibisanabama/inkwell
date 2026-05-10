import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Home from './pages/public/Home';
import Dashboard from './pages/admin/Dashboard';

// App.css is no longer needed as we use index.css for global styles, but let's keep it empty for component specific if needed, or just remove the import.

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            
            {/* Admin Routes (Will be protected later in Feature 1) */}
            <Route path="/admin/dashboard" element={<Dashboard />} />
            
            {/* Fallback */}
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
