/**
 * ListComparator Service
 * 
 * Compares two follower lists and identifies new followers and unfollowers.
 */

export interface ComparisonResult {
  newFollowers: string[];
  unfollowers: string[];
  timestamp: Date;
  oldSnapshotId: string;
  newSnapshotId: string;
}

export interface ListComparator {
  compare(oldList: string[], newList: string[], oldSnapshotId?: string, newSnapshotId?: string): ComparisonResult;
  findNewFollowers(oldList: string[], newList: string[]): string[];
  findUnfollowers(oldList: string[], newList: string[]): string[];
}

/**
 * Finds new followers by computing set difference: newList - oldList
 * Returns usernames present in newList but absent in oldList.
 * Comparison is case-insensitive.
 */
export function findNewFollowers(oldList: string[], newList: string[]): string[] {
  const oldSet = new Set(oldList.map(u => u.toLowerCase()));
  return newList.filter(username => !oldSet.has(username.toLowerCase()));
}

/**
 * Finds unfollowers by computing set difference: oldList - newList
 * Returns usernames present in oldList but absent in newList.
 * Comparison is case-insensitive.
 */
export function findUnfollowers(oldList: string[], newList: string[]): string[] {
  const newSet = new Set(newList.map(u => u.toLowerCase()));
  return oldList.filter(username => !newSet.has(username.toLowerCase()));
}

/**
 * Compares two follower lists and returns a ComparisonResult.
 * Identifies new followers and unfollowers between the two lists.
 */
export function compare(
  oldList: string[],
  newList: string[],
  oldSnapshotId: string = '',
  newSnapshotId: string = ''
): ComparisonResult {
  return {
    newFollowers: findNewFollowers(oldList, newList),
    unfollowers: findUnfollowers(oldList, newList),
    timestamp: new Date(),
    oldSnapshotId,
    newSnapshotId,
  };
}

// Export as an object implementing the interface for dependency injection
export const listComparator: ListComparator = {
  compare,
  findNewFollowers,
  findUnfollowers,
};

export default listComparator;
