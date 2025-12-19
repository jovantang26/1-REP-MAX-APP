import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBenchLoggingSession, useUnitSystem } from '../hooks';
import type { LiftType } from '../domain';
import { LIFT_DISPLAY_NAMES, createEmptySessionSetRow, validateSessionSetRow, type SessionSetRow } from '../domain';
import { benchSetRepository } from '../storage';
import { filterSetsByDateRange } from '../estimation';
import { formatWeightAsNumber, parseWeightInput, getUnitLabel } from '../utils';

/**
 * Log Training Session Screen (B3.3.1 - Session Mode Design)
 * 
 * B3.3.1 - Hevy-style session logging:
 * - Session mode with multiple editable set rows
 * - Each row has weight, reps, RIR inputs
 * - Can add/remove rows
 * - On save: validate all rows, convert to kg, persist, end session
 * 
 * UX RULES:
 * - Lift selector at top (Bench | Squat | Deadlift)
 * - Session rows table below
 * - Today's sets shown separately
 * - Per-lift filtering maintained
 */
export function LogBenchScreen() {
  const navigate = useNavigate();
  const [selectedLiftType, setSelectedLiftType] = useState<LiftType>('bench');
  const [todaySets, setTodaySets] = useState<any[]>([]);
  const { unitSystem } = useUnitSystem();
  const {
    saving,
    addSetToSession,
    saveSession,
    clearSession,
  } = useBenchLoggingSession(selectedLiftType);

  // B3.3.1 - Session mode state: array of in-progress set rows
  const [sessionRows, setSessionRows] = useState<SessionSetRow[]>([createEmptySessionSetRow()]);

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

  // B3.3.1 - Clear session rows when lift type changes
  React.useEffect(() => {
    setSessionRows([createEmptySessionSetRow()]);
    clearSession();
  }, [selectedLiftType, clearSession]);

  // B3.3.1 - Update a row's field value
  const updateRowField = (rowId: string, field: 'weight' | 'reps' | 'rir', value: string) => {
    setSessionRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? { ...row, [field]: value, hasError: false, errorMessage: undefined }
          : row
      )
    );
  };

  // B3.3.1 - Add a new empty row
  const addRow = () => {
    setSessionRows((prev) => [...prev, createEmptySessionSetRow()]);
  };

  // B3.3.1 - Remove a row
  const removeRow = (rowId: string) => {
    setSessionRows((prev) => {
      const filtered = prev.filter((row) => row.id !== rowId);
      // Always keep at least one row
      return filtered.length === 0 ? [createEmptySessionSetRow()] : filtered;
    });
  };

  // B3.3.1 - Save session: validate all rows, convert to kg, persist
  const handleSaveSession = async () => {
    // Validate all rows
    const errors: string[] = [];
    const validatedRows: SessionSetRow[] = [];

    for (const row of sessionRows) {
      const error = validateSessionSetRow(row, unitSystem);
      if (error) {
        errors.push(`Row ${sessionRows.indexOf(row) + 1}: ${error}`);
        validatedRows.push({ ...row, hasError: true, errorMessage: error });
      } else {
        validatedRows.push(row);
      }
    }

    // Update rows with errors
    if (errors.length > 0) {
      setSessionRows(validatedRows);
      alert(`Please fix the following errors:\n${errors.join('\n')}`);
      return;
    }

    // Convert all rows to BenchSets and add to session
    try {
      clearSession(); // Clear any existing session sets
      const timestamp = new Date();

      for (const row of validatedRows) {
        // Skip empty rows
        if (!row.weight.trim() || !row.reps.trim()) {
          continue;
        }

        // B3.1.3 - Parse and convert weight to kg
        const weightInKg = parseWeightInput(row.weight.trim(), unitSystem);
        const reps = parseInt(row.reps.trim(), 10);
        const rir = parseInt(row.rir.trim(), 10);

        // Add to session (will be persisted on saveSession)
        addSetToSession(weightInKg, reps, rir, timestamp);
      }

      // Save all sets to storage
      const saved = await saveSession();
      if (saved) {
        // Reload today's sets
        const allSets = await benchSetRepository.getBenchSets();
        const now = new Date();
        const todaySets = filterSetsByDateRange(allSets, 1, now);
        const filteredByLift = todaySets.filter((set) => set.liftType === selectedLiftType);
        setTodaySets(filteredByLift);

        // Reset session rows
        setSessionRows([createEmptySessionSetRow()]);

        // Navigate back to dashboard
        navigate('/dashboard');
      } else {
        alert('Failed to save session. Please try again.');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save session. Please check your inputs.');
    }
  };

  // B3.3.1 - Clear session
  const handleClearSession = () => {
    setSessionRows([createEmptySessionSetRow()]);
    clearSession();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
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

      {/* B3.3.1 - Session Mode: Editable set rows table */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: 0 }}>Session Sets - {LIFT_DISPLAY_NAMES[selectedLiftType]}</h2>
          <button
            onClick={addRow}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            + Add Row
          </button>
        </div>

        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '8px',
          overflowX: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontSize: '14px' }}>Weight ({getUnitLabel(unitSystem)})</th>
                <th style={{ textAlign: 'left', padding: '8px', fontSize: '14px' }}>Reps</th>
                <th style={{ textAlign: 'left', padding: '8px', fontSize: '14px' }}>RIR</th>
                <th style={{ textAlign: 'left', padding: '8px', fontSize: '14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessionRows.map((row, index) => (
                <tr 
                  key={row.id} 
                  style={{ 
                    borderBottom: '1px solid #eee',
                    backgroundColor: row.hasError ? '#ffe6e6' : 'transparent'
                  }}
                >
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={row.weight}
                      onChange={(e) => updateRowField(row.id, 'weight', e.target.value)}
                      placeholder="0.0"
                      style={{ 
                        width: '100%', 
                        padding: '6px', 
                        fontSize: '14px',
                        border: row.hasError ? '2px solid #dc3545' : '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      min="1"
                      value={row.reps}
                      onChange={(e) => updateRowField(row.id, 'reps', e.target.value)}
                      placeholder="0"
                      style={{ 
                        width: '100%', 
                        padding: '6px', 
                        fontSize: '14px',
                        border: row.hasError ? '2px solid #dc3545' : '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      value={row.rir}
                      onChange={(e) => updateRowField(row.id, 'rir', e.target.value)}
                      placeholder="0"
                      style={{ 
                        width: '100%', 
                        padding: '6px', 
                        fontSize: '14px',
                        border: row.hasError ? '2px solid #dc3545' : '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    {row.hasError && (
                      <div style={{ fontSize: '12px', color: '#dc3545', marginBottom: '4px' }}>
                        {row.errorMessage}
                      </div>
                    )}
                    <button
                      onClick={() => removeRow(row.id)}
                      disabled={sessionRows.length === 1}
                      style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        backgroundColor: sessionRows.length === 1 ? '#6c757d' : '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: sessionRows.length === 1 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* B2.3.1: Show only today's sets for selected liftType */}
      {todaySets.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Today's Saved Sets - {LIFT_DISPLAY_NAMES[selectedLiftType]} ({todaySets.length})</h3>
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
                  <th style={{ textAlign: 'left', padding: '8px' }}>Weight ({getUnitLabel(unitSystem)})</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Reps</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>RIR</th>
                </tr>
              </thead>
              <tbody>
                {todaySets.map((set) => (
                  <tr key={set.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{formatWeightAsNumber(set.weight, unitSystem).toFixed(1)}</td>
                    <td style={{ padding: '8px' }}>{set.reps}</td>
                    <td style={{ padding: '8px' }}>{set.rir}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* B3.3.1 - Session actions */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleClearSession}
          disabled={saving}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          Clear Session
        </button>
        <button
          onClick={handleSaveSession}
          disabled={saving}
          style={{
            flex: 2,
            padding: '12px',
            fontSize: '16px',
            backgroundColor: saving ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save Session'}
        </button>
      </div>
    </div>
  );
}
