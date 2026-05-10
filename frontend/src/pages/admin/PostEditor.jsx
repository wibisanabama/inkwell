import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiEye, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import RichTextEditor from '../../components/RichTextEditor';
import ImageUpload from '../../components/ImageUpload';
import '../../styles/posts.css';

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  
  // Data options
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    body: '',
    excerpt: '',
    status: 'draft',
    category_id: '',
    tags: [] // array of tag IDs
  });
  
  // File state for image upload
  const [featuredImage, setFeaturedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          api.get('/categories'),
          api.get('/tags')
        ]);
        setCategories(catRes.data.data || []);
        setTags(tagRes.data.data || []);
      } catch (error) {
        console.error('Failed to load options', error);
      }
    };

    fetchOptions();

    if (isEditMode) {
      const fetchPost = async () => {
        try {
          const response = await api.get(`/admin/posts/${id}`);
          const post = response.data.data;
          setFormData({
            title: post.title || '',
            slug: post.slug || '',
            body: post.body || '',
            excerpt: post.excerpt || '',
            status: post.status || 'draft',
            category_id: post.category_id || '',
            tags: post.tags ? post.tags.map(t => t.id) : []
          });
          if (post.featured_image) {
            setPreviewImage(post.featured_image);
          }
        } catch (error) {
          toast.error('Failed to load post');
          navigate('/admin/posts');
        } finally {
          setLoading(false);
        }
      };
      fetchPost();
    }
  }, [id, isEditMode, navigate]);

  // Generate slug from title automatically if not in edit mode (or if slug is empty)
  useEffect(() => {
    if (!isEditMode && formData.title && !formData.slug) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, isEditMode, formData.slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBodyChange = useCallback((content) => {
    setFormData(prev => ({ ...prev, body: content }));
  }, []);

  const handleTagToggle = (tagId) => {
    setFormData(prev => {
      const newTags = prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId];
      return { ...prev, tags: newTags };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category_id || !formData.body) {
      toast.error('Title, category, and body are required.');
      return;
    }

    setSaving(true);

    try {
      // In a real app with file upload, we'd use FormData here
      // For now, we are simulating it or relying on backend base64 processing if supported
      // Let's use a standard JSON payload as defined by the backend instructions
      const payload = {
        ...formData,
        featured_image: featuredImage // which is now a URL string returned from ImageUpload
      };

      // Note: If Feature 6 (Media Upload) implements multipart/form-data, 
      // this logic would change to use FormData API.

      if (isEditMode) {
        await api.put(`/admin/posts/${id}`, payload);
        toast.success('Post updated successfully');
      } else {
        await api.post('/admin/posts', payload);
        toast.success('Post created successfully');
        navigate('/admin/posts');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        toast.error('Please check the form for errors');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save post');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading editor...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            className="btn-icon" 
            onClick={() => navigate('/admin/posts')}
            title="Back to posts"
          >
            <FiArrowLeft size={20} />
          </button>
          <span style={{ color: 'var(--color-text-muted)' }}>
            {isEditMode ? 'Edit Post' : 'Create New Post'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isEditMode && (
            <a 
              href={`/post/${formData.slug}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary"
            >
              <FiEye /> Preview
            </a>
          )}
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={saving}
          >
            <FiSave /> {saving ? 'Saving...' : (isEditMode ? 'Update' : 'Publish')}
          </button>
        </div>
      </div>

      <div className="editor-layout">
        {/* Main Editor Column */}
        <div className="editor-main">
          <div style={{ padding: '2rem', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
            <input
              type="text"
              name="title"
              className="title-input"
              placeholder="Post Title..."
              value={formData.title}
              onChange={handleChange}
            />
            
            <div className="slug-input-wrapper" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
              <span>/post/</span>
              <input
                type="text"
                name="slug"
                className="slug-input"
                placeholder="post-slug"
                value={formData.slug}
                onChange={handleChange}
              />
            </div>

            <RichTextEditor 
              content={formData.body} 
              onChange={handleBodyChange} 
            />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="editor-sidebar">
          {/* Status Panel */}
          <div className="sidebar-panel">
            <h3 className="sidebar-panel-title">Publishing</h3>
            <div className="form-group">
              <label className="form-label" htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className="form-input"
                value={formData.status}
                onChange={handleChange}
                style={{ padding: '0.5rem', background: 'var(--color-bg)' }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Category Panel */}
          <div className="sidebar-panel">
            <h3 className="sidebar-panel-title">Category</h3>
            <div className="form-group">
              <select
                name="category_id"
                className="form-input"
                value={formData.category_id}
                onChange={handleChange}
                style={{ padding: '0.5rem', background: 'var(--color-bg)' }}
              >
                <option value="">Select Category...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags Panel */}
          <div className="sidebar-panel">
            <h3 className="sidebar-panel-title">Tags</h3>
            <div style={{ maxHeight: '150px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.5rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              {tags.length > 0 ? tags.map(tag => (
                <label 
                  key={tag.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    background: formData.tags.includes(tag.id) ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)',
                    color: formData.tags.includes(tag.id) ? 'white' : 'var(--color-text)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.tags.includes(tag.id)}
                    onChange={() => handleTagToggle(tag.id)}
                    style={{ display: 'none' }}
                  />
                  {tag.name}
                </label>
              )) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>No tags available</span>
              )}
            </div>
          </div>

          {/* Featured Image Panel */}
          <div className="sidebar-panel">
            <h3 className="sidebar-panel-title">Featured Image</h3>
            <ImageUpload 
              value={previewImage}
              onChange={(file) => setFeaturedImage(file)}
            />
          </div>

          {/* Excerpt Panel */}
          <div className="sidebar-panel">
            <h3 className="sidebar-panel-title">Excerpt</h3>
            <textarea
              name="excerpt"
              className="form-input"
              rows="4"
              placeholder="Write a brief summary..."
              value={formData.excerpt}
              onChange={handleChange}
              style={{ resize: 'vertical', background: 'var(--color-bg)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
