/**
 * UserProfile represents the user's physical characteristics and profile information.
 * This is used for personalizing 1RM predictions and strength category assessments.
 * 
 * B3.2.1 - Sex Selection: Updated to use structured sex field with optional text.
 */

export type Sex = "male" | "female" | "other";

export interface UserProfile {
  /** User's age in years */
  age: number;
  
  /** 
   * B3.2.1 - User's sex (male, female, or other).
   * Replaces the previous `gender` string field for structured selection.
   */
  sex: Sex;
  
  /** 
   * B3.2.1 - Optional text field when sex = "other".
   * Allows users to specify additional information if needed.
   */
  sexOtherText?: string;
  
  /** 
   * @deprecated B3.2.1 - Legacy field for backward compatibility during migration.
   * Use `sex` instead. This field will be removed in a future version.
   */
  gender?: string;
  
  /** User's bodyweight in kilograms */
  bodyweight: number;
  
  /** Optional: Date when the profile was created (ISO string or Date) */
  dateCreated?: Date | string;
  
  /** Optional: Date when the profile was last updated (ISO string or Date) */
  lastUpdated?: Date | string;
  
  /** 
   * B3.2.3 - Guest Mode Identity Layer
   * Unique identifier for the profile (UUID v4).
   * Used for local identity tracking without backend/auth.
   */
  profileId: string;
  
  /** 
   * B3.2.3 - Guest Mode Identity Layer
   * Timestamp when the profile was created.
   * Used for tracking profile age and identity.
   */
  profileCreatedAt: Date | string;
  
  /** 
   * B3.2.3 - Guest Mode Identity Layer
   * Flag indicating whether the user has completed onboarding.
   * Used to determine if user should see onboarding screen or dashboard.
   */
  hasCompletedOnboarding: boolean;
}

/**
 * B3.2.1 - Creates a new UserProfile with validation.
 * B3.2.3 - Adds guest mode identity fields (profileId, profileCreatedAt, hasCompletedOnboarding).
 * 
 * @param age - User's age in years (must be positive)
 * @param sex - User's sex ("male", "female", or "other")
 * @param bodyweight - User's bodyweight in kilograms (must be positive)
 * @param sexOtherText - Optional text when sex = "other"
 * @param dateCreated - Optional creation date (defaults to now)
 * @param lastUpdated - Optional last update date (defaults to now)
 * @param hasCompletedOnboarding - Whether onboarding is complete (defaults to true for new profiles)
 * @returns A validated UserProfile object
 * @throws Error if validation fails
 */
export function createUserProfile(
  age: number,
  sex: Sex,
  bodyweight: number,
  sexOtherText?: string,
  dateCreated?: Date | string,
  lastUpdated?: Date | string,
  hasCompletedOnboarding: boolean = true
): UserProfile {
  if (age <= 0) {
    throw new Error('Age must be a positive number');
  }
  
  if (sex !== 'male' && sex !== 'female' && sex !== 'other') {
    throw new Error('Sex must be "male", "female", or "other"');
  }
  
  if (bodyweight <= 0) {
    throw new Error('Bodyweight must be a positive number');
  }
  
  const now = new Date();
  
  // B3.2.3 - Generate UUID v4 for profileId
  const profileId = generateUUID();
  
  const profile: UserProfile = {
    age,
    sex,
    bodyweight,
    dateCreated: dateCreated || now,
    lastUpdated: lastUpdated || now,
    profileId,
    profileCreatedAt: dateCreated || now,
    hasCompletedOnboarding,
  };
  
  // Only include sexOtherText if sex is "other"
  if (sex === 'other' && sexOtherText) {
    profile.sexOtherText = sexOtherText.trim();
  }
  
  return profile;
}

/**
 * B3.2.3 - Generates a UUID v4 for profile identification.
 * Simple implementation for local identity (no crypto library required).
 * @returns UUID v4 string
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * B3.2.1 - Legacy function for backward compatibility.
 * Migrates old gender string to new sex field.
 * @deprecated Use createUserProfile with sex parameter instead.
 */
export function createUserProfileLegacy(
  age: number,
  gender: string,
  bodyweight: number,
  dateCreated?: Date | string,
  lastUpdated?: Date | string
): UserProfile {
  // Migrate gender string to sex enum
  const genderLower = gender.toLowerCase().trim();
  let sex: Sex;
  
  if (genderLower === 'male' || genderLower === 'm') {
    sex = 'male';
  } else if (genderLower === 'female' || genderLower === 'f' || genderLower === 'woman' || genderLower === 'women') {
    sex = 'female';
  } else {
    sex = 'other';
  }
  
  return createUserProfile(age, sex, bodyweight, genderLower !== 'male' && genderLower !== 'female' ? gender : undefined, dateCreated, lastUpdated);
}

/**
 * B3.2.1 - Type guard to check if an object is a valid UserProfile.
 * B3.2.3 - Updated to support guest mode identity fields.
 * Supports both new (sex) and legacy (gender) formats for migration.
 */
export function isUserProfile(obj: unknown): obj is UserProfile {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const profile = obj as Record<string, unknown>;
  
  const hasValidAge = typeof profile.age === 'number' && profile.age > 0;
  const hasValidBodyweight = typeof profile.bodyweight === 'number' && profile.bodyweight > 0;
  
  // B3.2.1 - Check for new sex field or legacy gender field
  const hasSex = profile.sex === 'male' || profile.sex === 'female' || profile.sex === 'other';
  const hasLegacyGender = typeof profile.gender === 'string' && profile.gender.length > 0;
  
  // B3.2.3 - Guest mode identity fields are optional for backward compatibility
  // If missing, they will be added during migration
  const hasValidIdentity = 
    (profile.profileId === undefined || typeof profile.profileId === 'string') &&
    (profile.profileCreatedAt === undefined || typeof profile.profileCreatedAt === 'string' || profile.profileCreatedAt instanceof Date) &&
    (profile.hasCompletedOnboarding === undefined || typeof profile.hasCompletedOnboarding === 'boolean');
  
  return hasValidAge && hasValidBodyweight && (hasSex || hasLegacyGender) && hasValidIdentity;
}

/**
 * B3.2.1 - Migrates a legacy UserProfile (with gender string) to new format (with sex enum).
 * B3.2.3 - Adds guest mode identity fields if missing.
 * This is a safe migration that preserves existing data.
 */
export function migrateUserProfile(profile: UserProfile): UserProfile {
  let migrated = { ...profile };
  
  // B3.2.1 - Migrate gender to sex if needed
  if (!(migrated.sex === 'male' || migrated.sex === 'female' || migrated.sex === 'other')) {
    if (migrated.gender) {
      const genderLower = migrated.gender.toLowerCase().trim();
      let sex: Sex;
      let sexOtherText: string | undefined;
      
      if (genderLower === 'male' || genderLower === 'm') {
        sex = 'male';
      } else if (genderLower === 'female' || genderLower === 'f' || genderLower === 'woman' || genderLower === 'women') {
        sex = 'female';
      } else {
        sex = 'other';
        sexOtherText = migrated.gender; // Preserve original text
      }
      
      migrated = {
        ...migrated,
        sex,
        sexOtherText,
        // Keep gender for backward compatibility during transition
      };
    } else {
      // Default to "other" if no gender/sex found
      migrated = {
        ...migrated,
        sex: 'other',
      };
    }
  }
  
  // B3.2.3 - Add guest mode identity fields if missing
  if (!migrated.profileId) {
    migrated.profileId = generateUUID();
  }
  
  if (!migrated.profileCreatedAt) {
    migrated.profileCreatedAt = migrated.dateCreated || new Date();
  }
  
  if (migrated.hasCompletedOnboarding === undefined) {
    // If profile exists, assume onboarding is complete
    migrated.hasCompletedOnboarding = true;
  }
  
  return migrated;
}

/**
 * B3.2.1 - Helper function to get sex/gender value from profile for backward compatibility.
 * Returns the sex field if available, otherwise falls back to gender field.
 * Normalizes the value to lowercase for use in logic.
 * 
 * @param profile - The user profile
 * @returns Normalized sex/gender string ("male", "female", or "other")
 */
export function getProfileSex(profile: UserProfile): string {
  if (profile.sex === 'male' || profile.sex === 'female' || profile.sex === 'other') {
    return profile.sex;
  }
  
  // Fallback to legacy gender field
  if (profile.gender) {
    const genderLower = profile.gender.toLowerCase().trim();
    if (genderLower === 'male' || genderLower === 'm') {
      return 'male';
    } else if (genderLower === 'female' || genderLower === 'f' || genderLower === 'woman' || genderLower === 'women') {
      return 'female';
    }
    return 'other';
  }
  
  // Default fallback
  return 'other';
}

