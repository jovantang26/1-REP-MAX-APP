import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Onboarding / Profile Setup Screen
 * 
 * Allows users to set up their initial profile with:
 * - Age
 * - Gender
 * - Bodyweight
 * - Optional known 1RM
 */
export function OnboardingScreen() {
  const navigate = useNavigate();
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [bodyweight, setBodyweight] = useState<string>('');
  const [knownOneRm, setKnownOneRm] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save profile data
    // Navigate to dashboard after onboarding
    navigate('/dashboard');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Onboarding / Profile</h1>
      <p>Let's set up your profile to get started.</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="age" style={{ display: 'block', marginBottom: '5px' }}>
            Age (years)
          </label>
          <input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="gender" style={{ display: 'block', marginBottom: '5px' }}>
            Gender
          </label>
          <input
            id="gender"
            type="text"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder="e.g., male, female, other"
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="bodyweight" style={{ display: 'block', marginBottom: '5px' }}>
            Bodyweight (kg)
          </label>
          <input
            id="bodyweight"
            type="number"
            step="0.1"
            value={bodyweight}
            onChange={(e) => setBodyweight(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="knownOneRm" style={{ display: 'block', marginBottom: '5px' }}>
            Known 1RM (kg) <span style={{ color: '#666' }}>(optional)</span>
          </label>
          <input
            id="knownOneRm"
            type="number"
            step="0.1"
            value={knownOneRm}
            onChange={(e) => setKnownOneRm(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Complete Setup
        </button>
      </form>
    </div>
  );
}

