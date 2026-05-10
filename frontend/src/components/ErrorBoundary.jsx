import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
          background: 'var(--color-bg)'
        }}>
          <FiAlertTriangle size={64} color="var(--color-danger)" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontFamily: 'var(--font-family-heading)', fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
            Something went wrong.
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '500px' }}>
            We've encountered an unexpected error. Please try refreshing the page or navigating back.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FiRefreshCw /> Refresh Page
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '3rem', padding: '1rem', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-md)', textAlign: 'left', maxWidth: '800px', overflow: 'auto' }}>
              <p style={{ fontWeight: 'bold', color: 'var(--color-danger)', marginBottom: '0.5rem' }}>{this.state.error?.toString()}</p>
              <pre style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{this.state.error?.stack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
