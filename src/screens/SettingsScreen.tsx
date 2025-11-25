import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Settings Screen
 * 
 * Provides access to:
 * - Profile settings
 * - Units preferences
 * - About information
 */
export function SettingsScreen() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Settings</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate('/onboarding')}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '10px',
            textAlign: 'left',
          }}
        >
          Edit Profile
        </button>

        <button
          onClick={() => {
            // TODO: Open units settings
            alert('Units settings coming soon');
          }}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '10px',
            textAlign: 'left',
          }}
        >
          Units (kg/lbs)
        </button>

        <button
          onClick={() => {
            // TODO: Show about information
            alert('1RM Prediction App (Beta 1)\n\nTrack and predict your bench press 1RM.');
          }}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          About
        </button>
      </div>
    </div>
  );
}

