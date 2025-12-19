import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnitSystem } from '../hooks';
import type { UnitSystem } from '../domain';

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
  const { unitSystem, loading: unitLoading, saveUnitSystem } = useUnitSystem();
  const [saving, setSaving] = useState(false);

  const handleUnitChange = async (newUnit: UnitSystem) => {
    if (newUnit === unitSystem || saving) {
      return;
    }

    setSaving(true);
    try {
      const saved = await saveUnitSystem(newUnit);
      if (saved) {
        // Optionally show a success message
        console.log(`Unit system changed to ${newUnit}`);
      }
    } catch (error) {
      console.error('Failed to save unit system:', error);
      alert('Failed to save unit preference. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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

        {/* B3.1.1 - Units Preference */}
        <div
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#f5f5f5',
            border: '2px solid #ddd',
            borderRadius: '4px',
            marginBottom: '10px',
          }}
        >
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
            Units
          </div>
          {unitLoading ? (
            <div style={{ color: '#666', fontSize: '14px' }}>Loading...</div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleUnitChange('kg')}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '14px',
                  backgroundColor: unitSystem === 'kg' ? '#007bff' : '#e9ecef',
                  color: unitSystem === 'kg' ? 'white' : '#333',
                  border: `2px solid ${unitSystem === 'kg' ? '#007bff' : '#ddd'}`,
                  borderRadius: '4px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: unitSystem === 'kg' ? 'bold' : 'normal',
                }}
              >
                kg
              </button>
              <button
                onClick={() => handleUnitChange('lbs')}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '8px',
                  fontSize: '14px',
                  backgroundColor: unitSystem === 'lbs' ? '#007bff' : '#e9ecef',
                  color: unitSystem === 'lbs' ? 'white' : '#333',
                  border: `2px solid ${unitSystem === 'lbs' ? '#007bff' : '#ddd'}`,
                  borderRadius: '4px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: unitSystem === 'lbs' ? 'bold' : 'normal',
                }}
              >
                lbs
              </button>
            </div>
          )}
        </div>

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

