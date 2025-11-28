import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBenchLoggingSession } from '../hooks';
import type { LiftType } from '../domain';
import { LIFT_DISPLAY_NAMES } from '../domain';
import { benchSetRepository } from '../storage';
import { filterSetsByDateRange } from '../estimation';

/**
 * Log Training Session Screen (B2.3.1 - Multi-Lift Logging)
 * 
 * Allows users to log sets for Bench, Squat, or Deadlift with:
 * - Lift selector (tabs at top)
 * - Weight
 * - Reps
 * - RIR (Reps in Reserve)
 * 
 * UX RULES (B2.3.1):
 * - Lift selector at top (Bench | Squat | Deadlift)
 * - Form stays the same regardless of selected lift
 * - List below shows ONLY today's sets for the selected liftType
 * - Each logged set MUST include liftType
 * - UI never mixes lifts in the same list
 * 
 * Includes ability to add multiple sets and end the session.
 */
export function LogBenchScreen() {
  const navigate = useNavigate();
  const [selectedLiftType, setSelectedLiftType] = useState<LiftType>('bench');
  const [todaySets, setTodaySets] = useState<any[]>([]);
  const {
    sessionSets,
    saving,
    addSetToSession,
    removeSetFromSession,
    saveSession,
    clearSession,
  } = useBenchLoggingSession(selectedLiftType);

  // Load today's sets for the selected lift type
  React.useEffect(() => {
    const loadTodaySets = async () => {
      try {
        const allSets = await benchSetRepository.getBenchSets();
        const now = new Date();
        const todaySets = filterSetsByDateRange(allSets, 1, now);
        const filteredByLift = todaySets.filter((set) => set.liftType === selectedLiftType);
        setTodaySets(filteredByLift);
      } catch (error) {
        console.error('Failed to load today\'s sets:', error);
        setTodaySets([]);
      }
    };
    loadTodaySets();
  }, [selectedLiftType]);
  
  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [currentReps, setCurrentReps] = useState<string>('');
  const [currentRir, setCurrentRir] = useState<string>('0');

  const handleAddSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentWeight && currentReps) {
      try {
        const weight = parseFloat(currentWeight.trim());
        const reps = parseInt(currentReps.trim(), 10);
        const rir = parseInt(currentRir.trim(), 10);
        
        if (isNaN(weight) || weight <= 0) {
          alert('Weight must be a positive number');
          return;
        }
        if (isNaN(reps) || reps <= 0) {
          alert('Reps must be a positive integer');
          return;
        }
        if (isNaN(rir) || rir < 0) {
          alert('RIR must be a non-negative integer');
          return;
        }
        
        addSetToSession(weight, reps, rir);
        setCurrentWeight('');
        setCurrentReps('');
        setCurrentRir('0');
      } catch (error) {
        alert('Failed to add set. Please check your inputs.');
      }
    }
  };

  const handleEndSession = async () => {
    const saved = await saveSession();
    if (saved) {
      // Reload today's sets after saving
      const allSets = await benchSetRepository.getBenchSets();
      const now = new Date();
      const todaySets = filterSetsByDateRange(allSets, 1, now);
      const filteredByLift = todaySets.filter((set) => set.liftType === selectedLiftType);
      setTodaySets(filteredByLift);
      navigate('/dashboard');
    } else {
      alert('Failed to save session. Please try again.');
    }
  };

  // Combine session sets with today's sets (all for selected liftType)
  const allTodaySets = [
    ...todaySets,
    ...sessionSets.filter((set) => set.liftType === selectedLiftType),
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Log Training Session</h1>
      
      {/* B2.3.1: Lift Selector */}
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
            onClick={() => {
              setSelectedLiftType(liftType);
              clearSession(); // Clear session when switching lifts
            }}
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
      
      <form onSubmit={handleAddSet} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label htmlFor="weight" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              step="0.1"
              min="0.1"
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            />
          </div>

          <div>
            <label htmlFor="reps" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              Reps
            </label>
            <input
              id="reps"
              type="number"
              value={currentReps}
              onChange={(e) => setCurrentReps(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            />
          </div>

          <div>
            <label htmlFor="rir" style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              RIR
            </label>
            <input
              id="rir"
              type="number"
              min="0"
              value={currentRir}
              onChange={(e) => setCurrentRir(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                fontSize: '16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Add Set
            </button>
          </div>
        </div>
      </form>

      {/* B2.3.1: Show only today's sets for selected liftType */}
      {allTodaySets.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Today's Sets - {LIFT_DISPLAY_NAMES[selectedLiftType]} ({allTodaySets.length})</h3>
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '8px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Weight (kg)</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Reps</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>RIR</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allTodaySets.map((set) => (
                  <tr key={set.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{set.weight}</td>
                    <td style={{ padding: '8px' }}>{set.reps}</td>
                    <td style={{ padding: '8px' }}>{set.rir}</td>
                    <td style={{ padding: '8px' }}>
                      {/* Only allow removing sets from current session, not already saved sets */}
                      {sessionSets.some((s) => s.id === set.id) && (
                        <button
                          onClick={() => removeSetFromSession(set.id)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={clearSession}
          disabled={saving || sessionSets.length === 0}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            backgroundColor: sessionSets.length === 0 ? '#6c757d' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: sessionSets.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          Clear Session
        </button>
        <button
          onClick={handleEndSession}
          disabled={saving || sessionSets.length === 0}
          style={{
            flex: 2,
            padding: '12px',
            fontSize: '16px',
            backgroundColor: saving || sessionSets.length === 0 ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: saving || sessionSets.length === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'End Session'}
        </button>
      </div>
    </div>
  );
}

