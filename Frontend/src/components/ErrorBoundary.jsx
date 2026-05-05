import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';

const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: "'Inter', sans-serif",
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        textAlign: 'center',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      }}>
        <h2 style={{ color: '#991b1b', marginBottom: '15px' }}>Oops! Something went wrong.</h2>
        <p style={{ color: '#4b5563', marginBottom: '25px', lineHeight: '1.5' }}>
          {error.statusText || error.message || "An unexpected error occurred in the application."}
        </p>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default ErrorBoundary;