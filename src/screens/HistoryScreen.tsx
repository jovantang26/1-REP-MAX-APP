import React, { useState, useEffect } from 'react';
import { useOneRmHistory, useUnitSystem } from '../hooks';
import type { LiftType, TestedPrAnchor } from '../domain';
import { LIFT_DISPLAY_NAMES } from '../domain';
import { formatWeight, getUnitLabel } from '../utils';
import { testedPrAnchorRepository } from '../storage';

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
  const { unitSystem } = useUnitSystem();
  const { dataPoints, stats, loading, error } = useOneRmHistory(selectedLiftType);
  
  // B3.5.3 - Load PR anchor for selected lift
  const [prAnchor, setPrAnchor] = useState<TestedPrAnchor | null>(null);
  
  useEffect(() => {
    const loadPrAnchor = async () => {
      const anchor = await testedPrAnchorRepository.getPrAnchorByLiftType(selectedLiftType);
      setPrAnchor(anchor);
    };
    loadPrAnchor();
  }, [selectedLiftType]);

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
      {/* B3.5.3 - Include powerclean in tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '2px solid #ddd',
        paddingBottom: '10px'
      }}>
        {(['bench', 'squat', 'deadlift', 'powerclean'] as LiftType[]).map((liftType) => (
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
            <p>Graph visualization will appear here showing:</p>
            <ul style={{ textAlign: 'left', display: 'inline-block', marginTop: '10px' }}>
              <li>90-day estimate curve (blue line)</li>
              <li>Tested 1RM points (red dots)</li>
              {prAnchor && (
                <li style={{ color: '#28a745', fontWeight: 'bold' }}>
                  PR Anchor: {formatWeight(prAnchor.bestTested1Rm, unitSystem, 1)} {getUnitLabel(unitSystem)} (green star marker)
                </li>
              )}
            </ul>
          </div>
        )}
        {/* B3.5.3 - Show PR anchor info if available */}
        {prAnchor && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            backgroundColor: '#e7f3ff', 
            borderRadius: '8px',
            border: '2px solid #28a745'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745', marginBottom: '5px' }}>
              ⭐ Personal Record (PR Anchor)
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
              {formatWeight(prAnchor.bestTested1Rm, unitSystem, 1)} {getUnitLabel(unitSystem)}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Achieved: {new Date(prAnchor.dateAchieved).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', fontStyle: 'italic' }}>
              This is your best tested 1RM and will be marked distinctly on the graph.
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginTop: '20px'
      }}>
        {/* B3.1.3 - Format stats in selected units */}
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '20px', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
            {stats.current1Rm !== null 
              ? `${formatWeight(stats.current1Rm, unitSystem, 1)} ${getUnitLabel(unitSystem)}` 
              : '--'}
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
            {stats.best1Rm !== null 
              ? `${formatWeight(stats.best1Rm, unitSystem, 1)} ${getUnitLabel(unitSystem)}` 
              : '--'}
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
              ? `${stats.progress30d >= 0 ? '+' : '-'}${formatWeight(Math.abs(stats.progress30d), unitSystem, 1)} ${getUnitLabel(unitSystem)}`
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

