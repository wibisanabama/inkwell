import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import '../../styles/posts.css';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, draft, published, archived
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      
      const response = await api.get('/admin/posts', { params });
      setPosts(response.data.data || []);
      setTotalPages(response.data.meta?.last_page || 1);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      fetchPosts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, page]);

  const openDeleteConfirm = (post) => {
    setCurrentPost(post);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!currentPost) return;
    
    try {
      await api.delete(`/admin/posts/${currentPost.id}`);
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPage(1); // reset to page 1
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Posts</h1>
        <Link to="/admin/posts/create" className="btn btn-primary">
          <FiPlus /> New Post
        </Link>
      </div>

      <div className="filters-bar">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-tab ${statusFilter === 'published' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('published')}
          >
            Published
          </button>
          <button 
            className={`filter-tab ${statusFilter === 'draft' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('draft')}
          >
            Drafts
          </button>
          <button 
            className={`filter-tab ${statusFilter === 'archived' ? 'active' : ''}`}
            onClick={() => handleStatusFilter('archived')}
          >
            Archived
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', minWidth: '250px' }}>
          <FiSearch color="var(--color-text-muted)" />
          <input 
            type="text" 
            placeholder="Search posts..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--color-text)', width: '100%', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Author</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-state">Loading posts...</td>
              </tr>
            ) : posts.length > 0 ? (
              posts.map(post => (
                <tr key={post.id}>
                  <td style={{ fontWeight: 500, maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {post.title}
                  </td>
                  <td>{post.category?.name || '-'}</td>
                  <td>
                    <span className={`badge badge-${post.status}`}>
                      {post.status}
                    </span>
                  </td>
                  <td>{post.author?.name || '-'}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="actions-cell">
                      {post.status === 'published' && (
                        <a href={`/post/${post.slug}`} target="_blank" rel="noopener noreferrer" className="btn-icon" title="View">
                          <FiEye />
                        </a>
                      )}
                      <Link to={`/admin/posts/${post.id}/edit`} className="btn-icon" title="Edit">
                        <FiEdit2 />
                      </Link>
                      <button className="btn-icon delete" onClick={() => openDeleteConfirm(post)} title="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  No posts found. {search ? 'Try a different search term.' : 'Create your first post!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button 
            className="btn btn-secondary" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
            Page {page} of {totalPages}
          </span>
          <button 
            className="btn btn-secondary" 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        message={`Are you sure you want to delete "${currentPost?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default Posts;
