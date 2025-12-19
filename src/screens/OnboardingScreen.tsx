import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile, useUnitSystem } from '../hooks';
import { createUserProfile, type LiftType, type Sex } from '../domain';
import { createTestedOneRm } from '../domain';
import { testedOneRmRepository } from '../storage';
import { formatWeightAsNumber, parseWeightInput, getUnitLabel } from '../utils';

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
  const { profile, saveProfile } = useUserProfile();
  const { unitSystem } = useUnitSystem();
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<Sex | ''>('');
  const [sexOtherText, setSexOtherText] = useState<string>('');
  const [bodyweight, setBodyweight] = useState<string>('');
  const [knownOneRm, setKnownOneRm] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Pre-fill form if profile exists
  // B3.1.3 - Convert stored kg values to display units
  // B3.2.1 - Pre-fill sex selection
  React.useEffect(() => {
    if (profile) {
      setAge(profile.age.toString());
      setSex(profile.sex || '');
      setSexOtherText(profile.sexOtherText || '');
      // Convert bodyweight from kg to display units
      setBodyweight(formatWeightAsNumber(profile.bodyweight, unitSystem).toString());
    }
  }, [profile, unitSystem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // B3.2.1 - Validate sex selection
      if (!sex || (sex !== 'male' && sex !== 'female' && sex !== 'other')) {
        alert('Please select a sex option');
        setSaving(false);
        return;
      }
      
      // B3.1.3 - Parse bodyweight input and convert to kg for storage
      const bodyweightInKg = parseWeightInput(bodyweight, unitSystem);
      
      // B3.2.1 - Create and save profile with sex field
      const newProfile = createUserProfile(
        parseInt(age, 10),
        sex as Sex,
        bodyweightInKg,
        sex === 'other' ? sexOtherText : undefined
      );
      
      const saved = await saveProfile(newProfile);

      // If user provided a known 1RM, save it as a tested 1RM
      if (knownOneRm && knownOneRm.trim() !== '') {
        try {
          // B3.1.3 - Parse 1RM input and convert to kg for storage
          const weightInKg = parseWeightInput(knownOneRm.trim(), unitSystem);
          
          // Default to 30 days ago since this is a "last tested" value, not tested today
          // This prevents the algorithm from over-weighting an old PR as if it was tested today
          const testedDate = new Date();
          testedDate.setDate(testedDate.getDate() - 30);
          
          // TODO (B2.2+): Allow user to select liftType during onboarding
          // For now, defaulting to "bench" to maintain backward compatibility
          // FUTURE-PROOFING: liftType is now required, so we must provide it
          const liftType: LiftType = 'bench';
          
          const tested1Rm = createTestedOneRm(
            `tested_${Date.now()}`,
            liftType,
            testedDate,
            weightInKg // Weight is now in kg
          );
          await testedOneRmRepository.addTestedOneRm(tested1Rm);
        } catch (error) {
          console.error('Error creating tested 1RM:', error);
          alert(error instanceof Error ? error.message : 'Failed to save 1RM. Please check your input.');
          setSaving(false);
          return;
        }
      }

      if (saved) {
        // Navigate to dashboard after onboarding
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
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

        {/* B3.2.1 - Sex Selection UI with buttons */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Sex
          </label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            {(['male', 'female', 'other'] as Sex[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSex(option)}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: sex === option ? 'bold' : 'normal',
                  backgroundColor: sex === option ? '#007bff' : '#f5f5f5',
                  color: sex === option ? 'white' : '#333',
                  border: sex === option ? '2px solid #007bff' : '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s',
                }}
              >
                {option}
              </button>
            ))}
          </div>
          
          {/* B3.2.1 - Optional text input when "other" is selected */}
          {sex === 'other' && (
            <div style={{ marginTop: '10px' }}>
              <label htmlFor="sexOtherText" style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#666' }}>
                Additional information (optional)
              </label>
              <input
                id="sexOtherText"
                type="text"
                value={sexOtherText}
                onChange={(e) => setSexOtherText(e.target.value)}
                placeholder="e.g., non-binary, prefer not to say"
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
          )}
        </div>

        {/* B3.1.3 - Bodyweight input in selected units */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="bodyweight" style={{ display: 'block', marginBottom: '5px' }}>
            Bodyweight ({getUnitLabel(unitSystem)})
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

        {/* B3.1.3 - Known 1RM input in selected units */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="knownOneRm" style={{ display: 'block', marginBottom: '5px' }}>
            Known 1RM ({getUnitLabel(unitSystem)}) <span style={{ color: '#666' }}>(optional)</span>
          </label>
          <input
            id="knownOneRm"
            type="number"
            step="0.1"
            min="0.1"
            value={knownOneRm}
            onChange={(e) => setKnownOneRm(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: saving ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Complete Setup'}
        </button>
      </form>
    </div>
  );
}

