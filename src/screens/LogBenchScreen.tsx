import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBenchLoggingSession, useUnitSystem } from '../hooks';
import type { LiftType } from '../domain';
import { LIFT_DISPLAY_NAMES, createEmptySessionSetRow, validateSessionSetRow, type SessionSetRow } from '../domain';
import { benchSetRepository } from '../storage';
import { filterSetsByDateRange } from '../estimation';
import { formatWeightAsNumber, parseWeightInput, getUnitLabel } from '../utils';
import { InfoIcon } from '../components';

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
  
  // B3.3.2 - Quick Add mode state
  const [mode, setMode] = useState<'session' | 'quick'>('session');
  const [quickAddWeight, setQuickAddWeight] = useState<string>('');
  const [quickAddReps, setQuickAddReps] = useState<string>('');
  const [quickAddRir, setQuickAddRir] = useState<string>('0');

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

  // B3.3.3 - Add X number of empty rows
  const addMultipleRows = (count: number) => {
    if (count <= 0 || count > 20) {
      alert('Please enter a number between 1 and 20');
      return;
    }
    const newRows = Array.from({ length: count }, () => createEmptySessionSetRow());
    setSessionRows((prev) => [...prev, ...newRows]);
  };

  // B3.3.3 - Copy previous set values to current row
  const copyPreviousSet = (rowId: string) => {
    setSessionRows((prev) => {
      const rowIndex = prev.findIndex((row) => row.id === rowId);
      if (rowIndex <= 0) return prev; // Can't copy if it's the first row or not found
      
      const previousRow = prev[rowIndex - 1];
      return prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              weight: previousRow.weight,
              reps: previousRow.reps,
              rir: previousRow.rir,
            }
          : row
      );
    });
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

  // B3.3.2 - Quick Add: Log single set immediately
  const handleQuickAdd = async () => {
    if (!quickAddWeight || !quickAddReps) {
      alert('Please enter weight and reps');
      return;
    }

    try {
      // Validate and convert to kg
      const weightInKg = parseWeightInput(quickAddWeight.trim(), unitSystem);
      const reps = parseInt(quickAddReps.trim(), 10);
      const rir = parseInt(quickAddRir.trim(), 10);

      if (isNaN(reps) || reps <= 0) {
        alert('Reps must be a positive integer');
        return;
      }
      if (isNaN(rir) || rir < 0) {
        alert('RIR must be a non-negative integer');
        return;
      }

      // Add to session and save immediately
      clearSession();
      addSetToSession(weightInKg, reps, rir);
      const saved = await saveSession();

      if (saved) {
        // Reload today's sets
        const allSets = await benchSetRepository.getBenchSets();
        const now = new Date();
        const todaySets = filterSetsByDateRange(allSets, 1, now);
        const filteredByLift = todaySets.filter((set) => set.liftType === selectedLiftType);
        setTodaySets(filteredByLift);

        // Clear quick add form
        setQuickAddWeight('');
        setQuickAddReps('');
        setQuickAddRir('0');
      } else {
        alert('Failed to save set. Please try again.');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save set. Please check your inputs.');
    }
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

      {/* B3.3.2 - Mode selector: Session vs Quick Add */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '2px solid #ddd',
        paddingBottom: '10px'
      }}>
        <button
          onClick={() => setMode('session')}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '16px',
            fontWeight: mode === 'session' ? 'bold' : 'normal',
            backgroundColor: mode === 'session' ? '#007bff' : '#f5f5f5',
            color: mode === 'session' ? 'white' : '#333',
            border: mode === 'session' ? '2px solid #007bff' : '2px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Session Mode
        </button>
        <button
          onClick={() => setMode('quick')}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '16px',
            fontWeight: mode === 'quick' ? 'bold' : 'normal',
            backgroundColor: mode === 'quick' ? '#007bff' : '#f5f5f5',
            color: mode === 'quick' ? 'white' : '#333',
            border: mode === 'quick' ? '2px solid #007bff' : '2px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Quick Add
        </button>
      </div>

      {/* B3.3.2 - Quick Add Mode */}
      {mode === 'quick' && (
        <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
          <h2 style={{ marginTop: 0, marginBottom: '15px' }}>Quick Add - {LIFT_DISPLAY_NAMES[selectedLiftType]}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Weight ({getUnitLabel(unitSystem)})
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={quickAddWeight}
                onChange={(e) => setQuickAddWeight(e.target.value)}
                placeholder="0.0"
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                Reps
              </label>
              <input
                type="number"
                min="1"
                value={quickAddReps}
                onChange={(e) => setQuickAddReps(e.target.value)}
                placeholder="0"
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                RIR
                {/* B3.4.1 - RIR explanation tooltip */}
                <InfoIcon text="RIR = reps you could still do before failure" />
              </label>
              <input
                type="number"
                min="0"
                value={quickAddRir}
                onChange={(e) => setQuickAddRir(e.target.value)}
                placeholder="0"
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={handleQuickAdd}
                disabled={saving}
                style={{
                  padding: '8px 16px',
                  fontSize: '16px',
                  backgroundColor: saving ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {saving ? 'Saving...' : 'Add Set'}
              </button>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
            Quick Add logs a single set immediately without session mode.
          </p>
        </div>
      )}

      {/* B3.3.1 - Session Mode: Editable set rows table */}
      {mode === 'session' && (
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ margin: 0 }}>Session Sets - {LIFT_DISPLAY_NAMES[selectedLiftType]}</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* B3.3.3 - Add X sets control */}
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <input
                type="number"
                min="1"
                max="20"
                defaultValue="1"
                id="addSetsCount"
                style={{ 
                  width: '60px', 
                  padding: '6px', 
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <button
                onClick={() => {
                  const countInput = document.getElementById('addSetsCount') as HTMLInputElement;
                  const count = parseInt(countInput?.value || '1', 10);
                  addMultipleRows(count);
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Add Sets
              </button>
            </div>
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
                <th style={{ textAlign: 'left', padding: '8px', fontSize: '14px' }}>
                  RIR
                  {/* B3.4.1 - RIR explanation tooltip */}
                  <InfoIcon text="RIR = reps you could still do before failure" />
                </th>
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
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                      {/* B3.3.3 - Copy previous set button */}
                      {sessionRows.indexOf(row) > 0 && (
                        <button
                          onClick={() => copyPreviousSet(row.id)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                          title="Copy previous set values"
                        >
                          Copy
                        </button>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

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

      {/* B3.3.1 - Session actions (only show in session mode) */}
      {mode === 'session' && (
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
      )}
    </div>
  );
}
