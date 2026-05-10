import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      // The API resource wraps data in a 'data' property
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(search.toLowerCase()) || 
    (category.description && category.description.toLowerCase().includes(search.toLowerCase()))
  );

  const openAddModal = () => {
    setCurrentCategory(null);
    setFormData({ name: '', description: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setCurrentCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (category) => {
    setCurrentCategory(category);
    setIsConfirmOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      if (currentCategory) {
        // Update
        await api.put(`/admin/categories/${currentCategory.id}`, formData);
        toast.success('Category updated successfully');
      } else {
        // Create
        await api.post('/admin/categories', formData);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
      } else {
        toast.error(error.response?.data?.message || 'Something went wrong');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentCategory) return;
    
    try {
      await api.delete(`/admin/categories/${currentCategory.id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Categories</h1>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FiPlus /> Add Category
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', maxWidth: '400px' }}>
        <FiSearch color="var(--color-text-muted)" />
        <input 
          type="text" 
          placeholder="Search categories..." 
          value={search}
          onChange={handleSearchChange}
          style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--color-text)', width: '100%' }}
        />
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Posts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="empty-state">Loading categories...</td>
              </tr>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map(category => (
                <tr key={category.id}>
                  <td style={{ fontWeight: 500 }}>{category.name}</td>
                  <td><span className="badge" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--color-text-muted)' }}>{category.slug}</span></td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {category.description || '-'}
                  </td>
                  <td>{category.posts_count || 0}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn-icon" onClick={() => openEditModal(category)} title="Edit">
                        <FiEdit2 />
                      </button>
                      <button className="btn-icon delete" onClick={() => openDeleteConfirm(category)} title="Delete">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-state">
                  No categories found. {search && 'Try clearing your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={currentCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              className={`form-input ${formErrors.name ? 'error' : ''}`}
              value={formData.name}
              onChange={handleFormChange}
              disabled={isSubmitting}
              placeholder="E.g., Technology"
            />
            {formErrors.name && <span className="error-message">{formErrors.name[0]}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              className={`form-input ${formErrors.description ? 'error' : ''}`}
              value={formData.description}
              onChange={handleFormChange}
              disabled={isSubmitting}
              rows="3"
              placeholder="Short description about this category"
              style={{ resize: 'vertical' }}
            />
            {formErrors.description && <span className="error-message">{formErrors.description[0]}</span>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${currentCategory?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default Categories;
