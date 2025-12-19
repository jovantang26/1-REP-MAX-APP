import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnitSystem } from '../hooks';
import type { UnitSystem, LiftType } from '../domain';
import { LIFT_DISPLAY_NAMES } from '../domain';
import { testedPrAnchorRepository } from '../storage';
import type { TestedPrAnchor } from '../domain';
import { formatWeight, getUnitLabel } from '../utils';

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
  
  // B3.5.1 - Load PR anchors per lift
  const [prAnchors, setPrAnchors] = useState<Record<LiftType, TestedPrAnchor | null>>({
    bench: null,
    squat: null,
    deadlift: null,
    powerclean: null,
  });
  const [loadingAnchors, setLoadingAnchors] = useState(true);

  useEffect(() => {
    const loadAnchors = async () => {
      try {
        const anchors = await testedPrAnchorRepository.getAllPrAnchors();
        setPrAnchors(anchors);
      } catch (error) {
        console.error('Failed to load PR anchors:', error);
      } finally {
        setLoadingAnchors(false);
      }
    };
    loadAnchors();
  }, []);

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

        {/* B3.5.1 - PR Anchors per Lift */}
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
          <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>
            Personal Records (PR Anchors)
          </div>
          {loadingAnchors ? (
            <div style={{ color: '#666', fontSize: '14px' }}>Loading...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(['bench', 'squat', 'deadlift', 'powerclean'] as LiftType[]).map((liftType) => {
                const anchor = prAnchors[liftType];
                return (
                  <div
                    key={liftType}
                    style={{
                      padding: '8px',
                      backgroundColor: anchor ? '#e7f3ff' : '#f9f9f9',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {LIFT_DISPLAY_NAMES[liftType]}
                    </div>
                    {anchor ? (
                      <div style={{ color: '#666' }}>
                        <div>
                          Best Tested: <strong>{formatWeight(anchor.bestTested1Rm, unitSystem, 1)} {getUnitLabel(unitSystem)}</strong>
                        </div>
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                          Achieved: {new Date(anchor.dateAchieved).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: '#999', fontStyle: 'italic' }}>
                        No tested PR yet
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            alert(
              '1RM Prediction App (Beta 3.0)\n\n' +
              'Track and predict your 1RM for multiple lifts:\n' +
              '• Bench Press\n' +
              '• Back Squat\n' +
              '• Deadlift (Conventional)\n' +
              '• Power Clean\n\n' +
              'Features:\n' +
              '• Per-lift baseline 1RM estimates\n' +
              '• Strength categories per lift\n' +
              '• 90-day history tracking\n' +
              '• Automatic calibration from tested 1RMs\n' +
              '• PR anchors (best tested 1RM per lift)\n\n' +
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

