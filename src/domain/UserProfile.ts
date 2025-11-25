/**
 * UserProfile represents the user's physical characteristics and profile information.
 * This is used for personalizing 1RM predictions and strength category assessments.
 */

export interface UserProfile {
  /** User's age in years */
  age: number;
  
  /** User's gender (e.g., "male", "female", "other") */
  gender: string;
  
  /** User's bodyweight in kilograms */
  bodyweight: number;
  
  /** Optional: Date when the profile was created (ISO string or Date) */
  dateCreated?: Date | string;
  
  /** Optional: Date when the profile was last updated (ISO string or Date) */
  lastUpdated?: Date | string;
}

/**
 * Creates a new UserProfile with validation.
 * @param age - User's age in years (must be positive)
 * @param gender - User's gender
 * @param bodyweight - User's bodyweight in kilograms (must be positive)
 * @param dateCreated - Optional creation date
 * @param lastUpdated - Optional last update date
 * @returns A validated UserProfile object
 * @throws Error if validation fails
 */
export function createUserProfile(
  age: number,
  gender: string,
  bodyweight: number,
  dateCreated?: Date | string,
  lastUpdated?: Date | string
): UserProfile {
  if (age <= 0) {
    throw new Error('Age must be a positive number');
  }
  
  if (!gender || gender.trim().length === 0) {
    throw new Error('Gender must be provided');
  }
  
  if (bodyweight <= 0) {
    throw new Error('Bodyweight must be a positive number');
  }
  
  return {
    age,
    gender: gender.trim(),
    bodyweight,
    dateCreated,
    lastUpdated,
  };
}

/**
 * Type guard to check if an object is a valid UserProfile
 */
export function isUserProfile(obj: unknown): obj is UserProfile {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const profile = obj as Record<string, unknown>;
  
  return (
    typeof profile.age === 'number' &&
    profile.age > 0 &&
    typeof profile.gender === 'string' &&
    profile.gender.length > 0 &&
    typeof profile.bodyweight === 'number' &&
    profile.bodyweight > 0
  );
}

