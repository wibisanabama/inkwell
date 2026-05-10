import React, { useCallback, useState, useEffect } from 'react';
import { FiUploadCloud, FiX, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const ImageUpload = ({ value, onChange }) => {
  const [preview, setPreview] = useState(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    setPreview(value);
  }, [value]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file) => {
    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast.error('Image size should be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      const imageUrl = response.data.url;
      setPreview(imageUrl);
      onChange(imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="image-upload-container">
      {preview ? (
        <div className="image-preview">
          <img src={preview} alt="Featured" />
          <div className="image-preview-overlay">
            <button type="button" className="btn btn-danger" onClick={handleRemove}>
              <FiX /> Remove Image
            </button>
          </div>
        </div>
      ) : isUploading ? (
        <div className="image-upload-zone" style={{ cursor: 'default' }}>
          <div style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Uploading...</div>
          <div style={{ width: '100%', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', height: '8px', overflow: 'hidden' }}>
            <div 
              style={{ 
                height: '100%', 
                backgroundColor: 'var(--color-primary)', 
                width: `${uploadProgress}%`,
                transition: 'width 0.2s ease'
              }} 
            />
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>{uploadProgress}%</div>
        </div>
      ) : (
        <div 
          className={`image-upload-zone ${isDragging ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('featured_image_input').click()}
        >
          <FiUploadCloud size={48} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
          <p style={{ margin: 0, fontWeight: 500 }}>Click or drag image here</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            JPEG, PNG, WEBP (Max 2MB)
          </p>
          <input 
            type="file" 
            id="featured_image_input" 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
