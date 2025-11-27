import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks';
import { createUserProfile } from '../domain';
import { createTestedOneRm } from '../domain';
import { testedOneRmRepository } from '../storage';

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
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [bodyweight, setBodyweight] = useState<string>('');
  const [knownOneRm, setKnownOneRm] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Pre-fill form if profile exists
  React.useEffect(() => {
    if (profile) {
      setAge(profile.age.toString());
      setGender(profile.gender);
      setBodyweight(profile.bodyweight.toString());
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Create and save profile
      const newProfile = createUserProfile(
        parseInt(age, 10),
        gender,
        parseFloat(bodyweight)
      );
      
      const saved = await saveProfile(newProfile);

      // If user provided a known 1RM, save it as a tested 1RM
      if (knownOneRm && knownOneRm.trim() !== '') {
        const trimmed = knownOneRm.trim();
        const weight = parseFloat(trimmed);
        
        // Debug logging
        console.log('Parsing 1RM:', { trimmed, weight, isNaN: isNaN(weight), type: typeof weight });
        
        if (isNaN(weight) || !isFinite(weight) || weight <= 0) {
          alert(`Please enter a valid positive number for 1RM. You entered: "${trimmed}"`);
          setSaving(false);
          return;
        }
        
        try {
          const tested1Rm = createTestedOneRm(
            `tested_${Date.now()}`,
            new Date(),
            weight
          );
          await testedOneRmRepository.addTestedOneRm(tested1Rm);
        } catch (error) {
          console.error('Error creating tested 1RM:', error);
          alert(`Failed to save 1RM: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

