import React, { useState } from 'react';
import { useOneRmHistory } from '../hooks';
import type { LiftType } from '../domain';
import { LIFT_DISPLAY_NAMES } from '../domain';

/**
 * 1RM History / Graph Screen (B2.3.3 - Multi-Lift History Filter)
 * 
 * Displays:
 * - 90-day graph of 1RM estimates and tested values
 * - Statistics and trends
 * 
 * B2.3.3 IMPLEMENTATION:
 * - Top-level filter tabs/buttons (Bench | Squat | Deadlift)
 * - When a lift is selected:
 *   - Graph updates to that lift's baseline curve
 *   - Points show tested 1RMs for that lift
 *   - Stats update accordingly
 * - No multi-lift combined view in Beta 2
 */
export function HistoryScreen() {
  const [selectedLiftType, setSelectedLiftType] = useState<LiftType>('bench');
  const { dataPoints, stats, loading, error } = useOneRmHistory(selectedLiftType);

  if (loading) {
    return (
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1>1RM History</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <h1>1RM History</h1>
        <p style={{ color: '#dc3545' }}>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>1RM History</h1>
      
      {/* B2.3.3: Lift Filter Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '2px solid #ddd',
        paddingBottom: '10px'
      }}>
        {(['bench', 'squat', 'deadlift'] as LiftType[]).map((liftType) => (
          <button
            key={liftType}
            onClick={() => setSelectedLiftType(liftType)}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '16px',
              fontWeight: selectedLiftType === liftType ? 'bold' : 'normal',
              backgroundColor: selectedLiftType === liftType ? '#007bff' : '#f5f5f5',
              color: selectedLiftType === liftType ? 'white' : '#333',
              border: selectedLiftType === liftType ? '2px solid #007bff' : '2px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {LIFT_DISPLAY_NAMES[liftType]}
          </button>
        ))}
      </div>

      {/* B2.3.3: Show selected lift type in graph header */}
      <div style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
        Showing history for: <strong>{LIFT_DISPLAY_NAMES[selectedLiftType]}</strong>
      </div>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '40px', 
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📈</div>
        <h2 style={{ color: '#666' }}>90-Day Graph</h2>
        <p style={{ color: '#999' }}>
          {dataPoints.length === 0 
            ? `No data available yet for ${LIFT_DISPLAY_NAMES[selectedLiftType]}. Log some sessions to see your progress!`
            : `Showing ${dataPoints.length} data points for ${LIFT_DISPLAY_NAMES[selectedLiftType]} over the last 90 days.`}
        </p>
        {dataPoints.length > 0 && (
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p>Graph visualization will appear here showing your 1RM estimates and tested values over time.</p>
          </div>
        )}
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginTop: '20px'
      }}>
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
            {stats.current1Rm !== null ? `${stats.current1Rm.toFixed(1)} kg` : '--'}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Current 1RM</div>
        </div>

        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
            {stats.best1Rm !== null ? `${stats.best1Rm.toFixed(1)} kg` : '--'}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Best 1RM</div>
        </div>

        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
            {stats.progress30d !== null 
              ? `${stats.progress30d >= 0 ? '+' : ''}${stats.progress30d.toFixed(1)} kg`
              : '--'}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Progress (30d)</div>
        </div>

        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
            {stats.totalSessions}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Total Sessions</div>
        </div>
      </div>
    </div>
  );
}

