import React from 'react';

/**
 * 1RM History / Graph Screen
 * 
 * Displays:
 * - 90-day graph of 1RM estimates and tested values
 * - Statistics and trends
 * 
 * Currently shows placeholder content.
 */
export function HistoryScreen() {
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
          Graph visualization will appear here showing your 1RM estimates and tested values over time.
        </p>
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
            --
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
            --
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
            --
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
            --
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>Total Sessions</div>
        </div>
      </div>
    </div>
  );
}

