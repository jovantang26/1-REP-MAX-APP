import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Log Bench Session Screen
 * 
 * Allows users to log bench press sets with:
 * - Weight
 * - Reps
 * - RIR (Reps in Reserve)
 * 
 * Includes ability to add multiple sets and end the session.
 */
export function LogBenchScreen() {
  const navigate = useNavigate();
  const [sets, setSets] = useState<Array<{ weight: string; reps: string; rir: string }>>([]);
  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [currentReps, setCurrentReps] = useState<string>('');
  const [currentRir, setCurrentRir] = useState<string>('0');

  const handleAddSet = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentWeight && currentReps) {
      setSets([...sets, {
        weight: currentWeight,
        reps: currentReps,
        rir: currentRir,
      }]);
      setCurrentWeight('');
      setCurrentReps('');
      setCurrentRir('0');
    }
  };

  const handleEndSession = () => {
    // TODO: Save session data
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Log Bench Session</h1>
      
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

      {sets.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Sets Logged ({sets.length})</h3>
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
                </tr>
              </thead>
              <tbody>
                {sets.map((set, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{set.weight}</td>
                    <td style={{ padding: '8px' }}>{set.reps}</td>
                    <td style={{ padding: '8px' }}>{set.rir}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <button
        onClick={handleEndSession}
        style={{
          width: '100%',
          padding: '12px',
          fontSize: '16px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        End Session
      </button>
    </div>
  );
}

