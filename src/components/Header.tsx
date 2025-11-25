import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Header component with navigation
 * 
 * Provides access to Settings and main navigation from all screens.
 */
export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show header on onboarding screen
  if (location.pathname === '/onboarding') {
    return null;
  }

  return (
    <header style={{
      backgroundColor: '#343a40',
      color: 'white',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    }}>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          backgroundColor: 'transparent',
          color: 'white',
          border: 'none',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        1RM Prediction
      </button>
      
      <nav style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            textDecoration: location.pathname === '/dashboard' ? 'underline' : 'none',
          }}
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate('/history')}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            textDecoration: location.pathname === '/history' ? 'underline' : 'none',
          }}
        >
          History
        </button>
        <button
          onClick={() => navigate('/settings')}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '5px 10px',
            borderRadius: '4px',
            border: '1px solid white',
          }}
        >
          Settings
        </button>
      </nav>
    </header>
  );
}

