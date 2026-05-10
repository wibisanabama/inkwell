import React, { useCallback, useState, useEffect } from 'react';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ImageUpload = ({ value, onChange }) => {
  const [preview, setPreview] = useState(value || null);
  const [isDragging, setIsDragging] = useState(false);

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
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      toast.error('Image size should be less than 2MB');
      return;
    }

    // Pass the file to the parent
    onChange(file);

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
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
