import React from 'react';
import { useNavigate } from 'react-router-dom';

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

  // Placeholder data - will be replaced with actual data later
  const baseline1Rm = '120';
  const uncertaintyRange = '±5 kg';
  const strengthCategory = 'Intermediate';
  const lastTested1Rm = '115 kg';
  const lastSetsCount = 3;

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
          Uncertainty: {uncertaintyRange}
        </div>
        <div style={{ color: '#666' }}>
          Strength Category: <strong>{strengthCategory}</strong>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0 }}>Last Tested 1RM</h3>
        <div style={{ fontSize: '24px' }}>
          {lastTested1Rm}
        </div>
      </div>

      <div style={{ 
        padding: '15px',
        backgroundColor: '#e7f3ff',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p style={{ margin: 0 }}>
          Based on your last {lastSetsCount} sets...
        </p>
      </div>

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

