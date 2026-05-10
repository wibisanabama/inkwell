import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import ConfirmDialog from '../../components/ConfirmDialog';

const CommentsAdmin = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, all
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentComment, setCurrentComment] = useState(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      // Assuming backend has an admin endpoint for listing all comments
      // If not, it might just be /admin/comments
      const response = await api.get('/admin/comments', {
        params: { status: filter, page }
      });
      setComments(response.data.data || []);
      setTotalPages(response.data.meta?.last_page || 1);
    } catch (error) {
      console.error('Failed to fetch comments', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [filter, page]);

  const handleStatusChange = async (commentId, isApproved) => {
    try {
      await api.put(`/admin/comments/${commentId}`, { is_approved: isApproved });
      toast.success(isApproved ? 'Comment approved' : 'Comment rejected');
      fetchComments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const openDeleteConfirm = (comment) => {
    setCurrentComment(comment);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!currentComment) return;
    try {
      await api.delete(`/admin/comments/${currentComment.id}`);
      toast.success('Comment deleted successfully');
      fetchComments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  const truncate = (str, n) => {
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Moderate Comments</h1>
      </div>

      <div className="filters-bar" style={{ marginBottom: '1.5rem', background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.5rem', border: '1px solid var(--color-border)' }}>
        <button 
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => { setFilter('pending'); setPage(1); }}
        >
          Pending
        </button>
        <button 
          className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => { setFilter('approved'); setPage(1); }}
        >
          Approved
        </button>
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => { setFilter('all'); setPage(1); }}
        >
          All
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Comment</th>
              <th>On Post</th>
              <th>Author</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-state">Loading comments...</td>
              </tr>
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <tr key={comment.id}>
                  <td style={{ maxWidth: '300px' }}>
                    <div style={{ color: 'var(--color-text)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                      {truncate(comment.body, 100)}
                    </div>
                  </td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                      {comment.post?.title || `Post #${comment.post_id}`}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{comment.user ? comment.user.name : comment.guest_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {comment.user ? comment.user.email : comment.guest_email}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${comment.is_approved ? 'badge-published' : 'badge-draft'}`}>
                      {comment.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="actions-cell">
                      {!comment.is_approved ? (
                        <button className="btn-icon" style={{ color: 'var(--color-primary)' }} onClick={() => handleStatusChange(comment.id, true)} title="Approve">
                          <FiCheck />
                        </button>
                      ) : (
                        <button className="btn-icon" style={{ color: 'var(--color-text-muted)' }} onClick={() => handleStatusChange(comment.id, false)} title="Reject/Unapprove">
                          <FiX />
                        </button>
                      )}
                      <button className="btn-icon delete" onClick={() => openDeleteConfirm(comment)} title="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  <FiMessageSquare size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <div>No {filter !== 'all' ? filter : ''} comments found.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </button>
          <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
            Page {page} of {totalPages}
          </span>
          <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment permanently?"
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default CommentsAdmin;
