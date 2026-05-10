import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import { FiMessageSquare, FiCornerDownRight } from 'react-icons/fi';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

// Recursive Comment Component
const CommentItem = ({ comment, onReply, postSlug }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const { user } = useContext(AuthContext);
  
  // Date formatting
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const formattedDate = new Date(comment.created_at).toLocaleDateString(undefined, dateOptions);

  return (
    <div className="comment-thread" style={{ marginBottom: '1.5rem' }}>
      <div className="comment-box" style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {(comment.user?.name || comment.guest_name || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                {comment.user ? comment.user.name : comment.guest_name}
              </span>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{formattedDate}</div>
            </div>
          </div>
        </div>
        
        <div style={{ margin: '0.75rem 0', color: 'var(--color-text)', lineHeight: 1.5 }}>
          {comment.body}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button 
            className="btn-icon" 
            style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            <FiCornerDownRight /> {showReplyForm ? 'Cancel' : 'Reply'}
          </button>
        </div>

        {showReplyForm && (
          <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '2px solid var(--color-border)' }}>
            <CommentForm 
              postSlug={postSlug} 
              parentId={comment.id} 
              onSuccess={() => {
                setShowReplyForm(false);
                onReply();
              }} 
            />
          </div>
        )}
      </div>

      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies" style={{ marginLeft: '2rem', marginTop: '1rem', paddingLeft: '1rem', borderLeft: '2px solid var(--color-border)' }}>
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              onReply={onReply} 
              postSlug={postSlug} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Form Component
const CommentForm = ({ postSlug, parentId = null, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    guest_name: user ? user.name : '',
    guest_email: user ? user.email : '',
    body: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        ...formData,
        parent_id: parentId
      };
      
      await api.post(`/posts/${postSlug}/comments`, payload);
      
      toast.success('Comment submitted! It may await moderation.');
      setFormData(prev => ({ ...prev, body: '' }));
      if (onSuccess) onSuccess();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || 'Failed to submit comment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'var(--color-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
      {!user && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <input 
              type="text" 
              name="guest_name" 
              className={`form-input ${errors.guest_name ? 'error' : ''}`}
              placeholder="Your Name *"
              value={formData.guest_name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.guest_name && <span className="error-message">{errors.guest_name[0]}</span>}
          </div>
          <div>
            <input 
              type="email" 
              name="guest_email" 
              className={`form-input ${errors.guest_email ? 'error' : ''}`}
              placeholder="Your Email *"
              value={formData.guest_email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.guest_email && <span className="error-message">{errors.guest_email[0]}</span>}
          </div>
        </div>
      )}
      
      <div style={{ marginBottom: '1rem' }}>
        <textarea 
          name="body" 
          className={`form-input ${errors.body ? 'error' : ''}`}
          placeholder="Leave a comment..."
          rows="3"
          value={formData.body}
          onChange={handleChange}
          disabled={isSubmitting}
          style={{ resize: 'vertical' }}
        ></textarea>
        {errors.body && <span className="error-message">{errors.body[0]}</span>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting || !formData.body.trim()}>
          {isSubmitting ? 'Submitting...' : (parentId ? 'Post Reply' : 'Post Comment')}
        </button>
      </div>
    </form>
  );
};

// Main Section Component
const CommentSection = ({ postSlug }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    if (!postSlug) return;
    try {
      setLoading(true);
      const response = await api.get(`/posts/${postSlug}/comments`);
      // Assuming response structure gives data.data or directly the array
      setComments(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch comments', error);
      // Optional: toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  return (
    <div className="comments-section" style={{ marginTop: '3rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <FiMessageSquare /> Comments ({comments.length})
      </h3>

      <div style={{ marginBottom: '2rem' }}>
        <CommentForm postSlug={postSlug} onSuccess={fetchComments} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Loading comments...</div>
      ) : comments.length > 0 ? (
        <div className="comments-list">
          {comments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              onReply={fetchComments} 
              postSlug={postSlug} 
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', background: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)' }}>
          No comments yet. Be the first to share your thoughts!
        </div>
      )}
    </div>
  );
};

export default CommentSection;
