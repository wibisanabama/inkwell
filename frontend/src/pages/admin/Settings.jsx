import React, { useState, useEffect } from 'react';
import { FiSave, FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_name: 'Inkwell',
    site_description: 'A modern platform for thinkers.',
    posts_per_page: 10,
    allow_comments: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        // Backend returns an object with key-value pairs or an array of objects
        // Let's assume it returns { site_name: "Inkwell", allow_comments: "true", ... }
        // or data: { site_name: "...", ... }
        const data = response.data.data || response.data;
        
        if (data && Object.keys(data).length > 0) {
          // Normalize boolean values if they come as strings
          const allowComments = data.allow_comments === 'true' || data.allow_comments === true || data.allow_comments === '1';
          
          setSettings({
            site_name: data.site_name || '',
            site_description: data.site_description || '',
            posts_per_page: parseInt(data.posts_per_page) || 10,
            allow_comments: allowComments
          });
        }
      } catch (error) {
        console.error('Failed to load settings', error);
        toast.error('Failed to load site settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Backend expects bulk update, possibly an object with keys
      await api.put('/admin/settings', {
        settings: {
          ...settings,
          allow_comments: settings.allow_comments ? 'true' : 'false',
          posts_per_page: String(settings.posts_per_page)
        }
      });
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Loading settings...</h1>
        </div>
        <div style={{ height: '300px', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title"><FiSettings style={{ marginRight: '0.5rem' }} /> Site Settings</h1>
      </div>

      <div style={{ maxWidth: '800px', background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Site Name</label>
            <input 
              type="text" 
              name="site_name" 
              className="form-input" 
              value={settings.site_name} 
              onChange={handleChange} 
              required
            />
            <small style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
              This will be displayed in the header and browser tab.
            </small>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Site Description</label>
            <textarea 
              name="site_description" 
              className="form-input" 
              value={settings.site_description} 
              onChange={handleChange} 
              rows="3"
            />
            <small style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
              A short description used for SEO and the footer.
            </small>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Posts Per Page</label>
            <input 
              type="number" 
              name="posts_per_page" 
              className="form-input" 
              value={settings.posts_per_page} 
              onChange={handleChange} 
              min="1"
              max="50"
              style={{ maxWidth: '150px' }}
            />
            <small style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block' }}>
              Number of articles to display per page on the blog list.
            </small>
          </div>

          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="checkbox" 
                  name="allow_comments" 
                  checked={settings.allow_comments} 
                  onChange={handleChange} 
                  style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
                />
                <div style={{ 
                  width: '44px', 
                  height: '24px', 
                  background: settings.allow_comments ? 'var(--color-primary)' : 'var(--color-border)', 
                  borderRadius: '12px', 
                  transition: '0.3s',
                  position: 'relative'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '2px',
                    left: settings.allow_comments ? '22px' : '2px',
                    transition: '0.3s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                  }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 500 }}>Allow Comments</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Enable or disable comments globally across all posts.</span>
              </div>
            </label>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <FiSave style={{ marginRight: '0.5rem' }} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
