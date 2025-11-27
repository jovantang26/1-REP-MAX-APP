import React from 'react';
import { useOneRmHistory } from '../hooks';

/**
 * 1RM History / Graph Screen
 * 
 * Displays:
 * - 90-day graph of 1RM estimates and tested values
 * - Statistics and trends
 */
export function HistoryScreen() {
  const { dataPoints, stats, loading, error } = useOneRmHistory();

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
            ? 'No data available yet. Log some bench sessions to see your progress!'
            : `Showing ${dataPoints.length} data points over the last 90 days.`}
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

