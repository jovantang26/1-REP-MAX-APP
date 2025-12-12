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
            alert(
              '1RM Prediction App (Beta 2.0)\n\n' +
              'Track and predict your 1RM for multiple lifts:\n' +
              '• Bench Press\n' +
              '• Back Squat\n' +
              '• Deadlift (Conventional)\n\n' +
              'Features:\n' +
              '• Per-lift baseline 1RM estimates\n' +
              '• Strength categories per lift\n' +
              '• 90-day history tracking\n' +
              '• Automatic calibration from tested 1RMs\n\n' +
              'Your data is tracked independently for each lift.'
            );
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

