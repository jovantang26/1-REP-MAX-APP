import type { StrengthCategoryType } from '../domain';

/**
 * B3.4.2 - Strength Category Descriptions
 * 
 * Supportive microcopy for each strength category to help users understand
 * their progress and feel encouraged.
 */

const CATEGORY_DESCRIPTIONS: Record<StrengthCategoryType, string> = {
  novice: 'You\'re building a solid foundation. Every rep counts!',
  intermediate: 'Great progress! You\'re developing real strength.',
  advanced: 'Impressive strength! You\'re in the top tier of lifters.',
  elite: 'Exceptional strength! You\'re among the strongest lifters.',
};

/**
 * B3.4.2 - Gets a supportive description for a strength category.
 * 
 * @param category - The strength category type
 * @returns A supportive description string
 */
export function getCategoryDescription(category: StrengthCategoryType | string): string {
  const normalizedCategory = category.toLowerCase() as StrengthCategoryType;
  return CATEGORY_DESCRIPTIONS[normalizedCategory] || CATEGORY_DESCRIPTIONS.novice;
}

