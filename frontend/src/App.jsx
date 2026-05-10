import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Components & Layouts
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Dashboard from './pages/admin/Dashboard';
import Categories from './pages/admin/Categories';
import Tags from './pages/admin/Tags';
import Posts from './pages/admin/Posts';
import PostEditor from './pages/admin/PostEditor';
import Comments from './pages/admin/Comments';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Public Routes (Accessible by anyone) */}
            <Route path="/" element={<Home />} />
            
            {/* Guest Routes (Only accessible if NOT logged in) */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
            
            {/* Admin Routes (Only accessible if logged in) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/categories" element={<Categories />} />
                <Route path="/admin/tags" element={<Tags />} />
                
                {/* Posts */}
                <Route path="/admin/posts" element={<Posts />} />
                <Route path="/admin/posts/create" element={<PostEditor />} />
                <Route path="/admin/posts/:id/edit" element={<PostEditor />} />

                {/* Comments */}
                <Route path="/admin/comments" element={<Comments />} />

                {/* Future Admin Routes will go here */}
                <Route path="/admin/settings" element={<div>Settings (Placeholder)</div>} />
              </Route>
            </Route>
            
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
