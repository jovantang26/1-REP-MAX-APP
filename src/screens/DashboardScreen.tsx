import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentBaselineOneRm } from '../hooks';
import { testedOneRmRepository } from '../storage';

/**
 * Home / Dashboard Screen
 * 
 * Displays:
 * - Current baseline 1RM
 * - Uncertainty range
 * - Strength category
 * - Last tested 1RM
 * - Summary text about recent sets
 */
export function DashboardScreen() {
  const navigate = useNavigate();
  const { result, loading, error } = useCurrentBaselineOneRm();
  const [lastTested1Rm, setLastTested1Rm] = React.useState<number | null>(null);

  // Load last tested 1RM
  React.useEffect(() => {
    testedOneRmRepository.getLatestTestedOneRm().then((tested) => {
      if (tested) {
        setLastTested1Rm(tested.weight);
      }
    });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Dashboard</h1>
        <p style={{ color: '#dc3545' }}>
          {error ? `Error: ${error.message}` : 'No profile found. Please complete onboarding.'}
        </p>
        <button
          onClick={() => navigate('/onboarding')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px',
          }}
        >
          Go to Onboarding
        </button>
      </div>
    );
  }

  const baseline1Rm = result.baselineOneRm.toFixed(1);
  const uncertaintyLow = result.uncertaintyRange.low.toFixed(1);
  const uncertaintyHigh = result.uncertaintyRange.high.toFixed(1);
  const strengthCategory = result.strengthCategory.category.charAt(0).toUpperCase() + 
    result.strengthCategory.category.slice(1);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Dashboard</h1>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ marginTop: 0 }}>Current Baseline 1RM</h2>
        <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
          {baseline1Rm} kg
        </div>
        <div style={{ color: '#666', marginBottom: '10px' }}>
          Uncertainty: {uncertaintyLow} - {uncertaintyHigh} kg
        </div>
        <div style={{ color: '#666', marginBottom: '10px' }}>
          Confidence: {(result.confidenceLevel * 100).toFixed(0)}%
        </div>
        <div style={{ color: '#666' }}>
          Strength Category: <strong>{strengthCategory}</strong>
        </div>
      </div>

      {lastTested1Rm !== null && (
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{ marginTop: 0 }}>Last Tested 1RM</h3>
          <div style={{ fontSize: '24px' }}>
            {lastTested1Rm.toFixed(1)} kg
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate('/log-session')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Log Bench Session
        </button>
        
        <button
          onClick={() => navigate('/history')}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          View History
        </button>
      </div>
    </div>
  );
}

