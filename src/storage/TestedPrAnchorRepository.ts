import type { TestedPrAnchor, LiftType } from '../domain';
import { isTestedPrAnchor, createTestedPrAnchor } from '../domain';
import { STORAGE_KEYS, getStorageItem, setStorageItem, serializeDate, deserializeDate } from './storageUtils';

/**
 * B3.5.1 - TestedPrAnchorRepository handles storage and retrieval of tested PR anchors.
 * 
 * PR anchors are the best tested 1RM values per lift that are never overwritten by estimates.
 * They serve as truth markers and provide trust in the system.
 * 
 * STORAGE SCHEMA:
 * - Uses shared collection (TESTED_PR_ANCHORS) for ALL lift types
 * - Each anchor is keyed by liftType
 * - Only one anchor per liftType (best tested 1RM)
 * 
 * PER-LIFT INDEPENDENCE RULE: Each lift has its own PR anchor.
 */
export class TestedPrAnchorRepository {
  private readonly storageKey = STORAGE_KEYS.TESTED_PR_ANCHORS;

  /**
   * Retrieves all PR anchors from storage.
   * @returns Record mapping liftType to TestedPrAnchor, or empty object if none exist
   */
  async getAllPrAnchors(): Promise<Record<LiftType, TestedPrAnchor | null>> {
    const stored = getStorageItem<unknown>(this.storageKey);
    
    if (stored === null || typeof stored !== 'object') {
      return {
        bench: null,
        squat: null,
        deadlift: null,
        powerclean: null,
      };
    }

    const anchors: Record<LiftType, TestedPrAnchor | null> = {
      bench: null,
      squat: null,
      deadlift: null,
      powerclean: null,
    };

    const storedObj = stored as Record<string, unknown>;
    
    // Validate and deserialize each anchor
    for (const liftType of ['bench', 'squat', 'deadlift', 'powerclean'] as LiftType[]) {
      const anchorData = storedObj[liftType];
      if (anchorData && isTestedPrAnchor(anchorData)) {
        anchors[liftType] = {
          ...anchorData,
          dateAchieved: typeof anchorData.dateAchieved === 'string'
            ? deserializeDate(anchorData.dateAchieved)
            : anchorData.dateAchieved,
        };
      }
    }

    return anchors;
  }

  /**
   * Retrieves the PR anchor for a specific lift type.
   * @param liftType - The lift type
   * @returns The PR anchor for the lift, or null if none exists
   */
  async getPrAnchorByLiftType(liftType: LiftType): Promise<TestedPrAnchor | null> {
    const allAnchors = await this.getAllPrAnchors();
    return allAnchors[liftType] || null;
  }

  /**
   * Saves or updates a PR anchor for a specific lift type.
   * B3.5.1 - Only updates if the new tested 1RM is greater than the existing one.
   * 
   * @param anchor - The PR anchor to save
   * @returns true if the anchor was saved/updated, false if it was skipped (not a new PR)
   */
  async savePrAnchor(anchor: TestedPrAnchor): Promise<boolean> {
    const allAnchors = await this.getAllPrAnchors();
    const existingAnchor = allAnchors[anchor.liftType];

    // Only update if this is a new PR (greater than existing)
    if (existingAnchor && existingAnchor.bestTested1Rm >= anchor.bestTested1Rm) {
      return false; // Not a new PR, skip update
    }

    // Save the new PR anchor
    const updatedAnchors: Record<LiftType, TestedPrAnchor | null> = {
      ...allAnchors,
      [anchor.liftType]: {
        ...anchor,
        dateAchieved: serializeDate(anchor.dateAchieved),
      },
    };

    setStorageItem(this.storageKey, updatedAnchors);
    return true;
  }

  /**
   * Removes the PR anchor for a specific lift type.
   * @param liftType - The lift type
   */
  async removePrAnchor(liftType: LiftType): Promise<void> {
    const allAnchors = await this.getAllPrAnchors();
    const updatedAnchors: Record<LiftType, TestedPrAnchor | null> = {
      ...allAnchors,
      [liftType]: null,
    };
    setStorageItem(this.storageKey, updatedAnchors);
  }

  /**
   * Clears all PR anchors.
   */
  async clearAllPrAnchors(): Promise<void> {
    setStorageItem(this.storageKey, {
      bench: null,
      squat: null,
      deadlift: null,
      powerclean: null,
    });
  }
}

// Export a singleton instance
export const testedPrAnchorRepository = new TestedPrAnchorRepository();

