/**
 * Sorting Utilities
 * 
 * Functions for sorting follower lists.
 */

export type SortOption = 'alphabetical' | 'date' | 'none';

/**
 * Sorts usernames alphabetically (case-insensitive).
 */
export function sortAlphabetically(usernames: string[]): string[] {
  return [...usernames].sort((a, b) => 
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
}

/**
 * Sorts usernames based on the specified option.
 */
export function sortUsernames(usernames: string[], option: SortOption): string[] {
  switch (option) {
    case 'alphabetical':
      return sortAlphabetically(usernames);
    case 'none':
    default:
      return [...usernames];
  }
}

export default { sortAlphabetically, sortUsernames };
