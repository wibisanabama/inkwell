import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertCircle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{ fontSize: '8rem', fontWeight: '900', color: 'var(--color-primary)', lineHeight: 1, marginBottom: '1rem', opacity: 0.8 }}>
        404
      </div>
      <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '2.5rem', marginBottom: '1rem' }}>
        Page Not Found
      </h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '1.125rem', maxWidth: '500px', marginBottom: '2rem' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1.125rem' }}>
        <FiHome style={{ marginRight: '0.5rem' }} /> Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
