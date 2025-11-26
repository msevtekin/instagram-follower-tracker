/**
 * ComparisonResult Model
 * 
 * Represents the result of comparing two follower list snapshots.
 * Includes snapshot metadata (id, timestamp, count) for both compared snapshots.
 */

export interface SnapshotMetadata {
  id: string;
  createdAt: Date;
  followerCount: number;
}

export interface ComparisonResult {
  newFollowers: string[];
  unfollowers: string[];
  oldSnapshot: SnapshotMetadata;
  newSnapshot: SnapshotMetadata;
}

/**
 * Creates a ComparisonResult with the given parameters.
 */
export function createComparisonResult(
  newFollowers: string[],
  unfollowers: string[],
  oldSnapshot: SnapshotMetadata,
  newSnapshot: SnapshotMetadata
): ComparisonResult {
  return {
    newFollowers: [...newFollowers],
    unfollowers: [...unfollowers],
    oldSnapshot: { ...oldSnapshot },
    newSnapshot: { ...newSnapshot },
  };
}

export default {
  createComparisonResult,
};
