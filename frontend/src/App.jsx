import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Components & Layouts
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';

// Pages
import Home from './pages/public/Home';
import Blog from './pages/public/Blog';
import PostDetail from './pages/public/PostDetail';
import CategoryPosts from './pages/public/CategoryPosts';
import NotFound from './pages/public/NotFound';

import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Dashboard from './pages/admin/Dashboard';
import Categories from './pages/admin/Categories';
import Tags from './pages/admin/Tags';
import Posts from './pages/admin/Posts';
import PostEditor from './pages/admin/PostEditor';
import Comments from './pages/admin/Comments';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Routes>
              {/* Public Routes (Accessible by anyone) */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/post/:slug" element={<PostDetail />} />
                <Route path="/category/:slug" element={<CategoryPosts />} />
                
                {/* Fallback for public layout (404) */}
                <Route path="*" element={<NotFound />} />
              </Route>
              
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

                  {/* Settings */}
                  <Route path="/admin/settings" element={<Settings />} />
                </Route>
              </Route>
            </Routes>
          </div>
          <Toaster position="top-right" />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
