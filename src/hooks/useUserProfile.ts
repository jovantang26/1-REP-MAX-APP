import { useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../domain';
import { profileRepository } from '../storage';

/**
 * Hook for managing user profile data.
 * 
 * Provides:
 * - Profile data loading
 * - Profile saving/updating
 * - Loading state
 * 
 * @returns Object with profile, loading state, and save function
 */
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load profile on mount
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError(null);
        const loadedProfile = await profileRepository.getProfile();
        
        if (!cancelled) {
          setProfile(loadedProfile);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load profile'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  // Save profile function
  const saveProfile = useCallback(async (newProfile: UserProfile) => {
    try {
      setError(null);
      await profileRepository.saveProfile(newProfile);
      setProfile(newProfile);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save profile');
      setError(error);
      return false;
    }
  }, []);

  return {
    profile,
    loading,
    error,
    saveProfile,
  };
}

