import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiSearch, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import ConfirmDialog from '../../components/ConfirmDialog';
import '../../styles/components.css'; // For common styling

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Inline add state
  const [newTagName, setNewTagName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirm state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tags');
      setTags(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/tags', { name: newTagName });
      toast.success('Tag added successfully');
      setNewTagName('');
      fetchTags();
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.errors?.name?.[0] || 'Failed to add tag');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (tag) => {
    setCurrentTag(tag);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!currentTag) return;
    
    try {
      await api.delete(`/tags/${currentTag.id}`);
      toast.success('Tag deleted successfully');
      fetchTags();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete tag');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Tags</h1>
      </div>

      <div className="tags-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Tags Display */}
        <div className="tags-main">
          {/* Search Bar */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', maxWidth: '400px' }}>
            <FiSearch color="var(--color-text-muted)" />
            <input 
              type="text" 
              placeholder="Search tags..." 
              value={search}
              onChange={handleSearchChange}
              style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--color-text)', width: '100%' }}
            />
          </div>

          <div className="tags-container" style={{ background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', minHeight: '300px' }}>
            {loading ? (
              <p className="empty-state" style={{ padding: 0 }}>Loading tags...</p>
            ) : filteredTags.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {filteredTags.map(tag => (
                  <div 
                    key={tag.id} 
                    className="tag-badge"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--color-primary)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <FiTag size={14} />
                    <span>{tag.name}</span>
                    <button 
                      onClick={() => openDeleteConfirm(tag)}
                      title="Delete Tag"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-error)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: '2px',
                        marginLeft: '4px',
                        borderRadius: '50%',
                        opacity: 0.7,
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.opacity = 1;
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.opacity = 0.7;
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state" style={{ padding: 0 }}>
                No tags found. {search ? 'Try a different search term.' : 'Add your first tag!'}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Add Tag Form */}
        <div className="add-tag-sidebar" style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', position: 'sticky', top: '80px' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem' }}>Add New Tag</h3>
          <form onSubmit={handleAddTag} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Laravel"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                disabled={isSubmitting}
                style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg)' }}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting || !newTagName.trim()}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <FiPlus /> {isSubmitting ? 'Adding...' : 'Add Tag'}
            </button>
          </form>
        </div>

      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Tag"
        message={`Are you sure you want to delete the tag "${currentTag?.name}"? It will be removed from all associated posts.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default Tags;
