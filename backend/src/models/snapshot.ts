/**
 * Snapshot Model
 * 
 * Represents a timestamped snapshot of a user's follower list.
 * Includes serialization methods for JSON storage.
 */

export interface Snapshot {
  id: string;
  userId: string;
  followers: string[];
  followerCount: number;
  createdAt: Date;
}

export interface SnapshotJSON {
  id: string;
  userId: string;
  followers: string[];
  followerCount: number;
  createdAt: string; // ISO 8601 format
}

/**
 * Serializes a Snapshot object to JSON format.
 * Converts Date to ISO string for storage.
 */
export function toJSON(snapshot: Snapshot): SnapshotJSON {
  return {
    id: snapshot.id,
    userId: snapshot.userId,
    followers: [...snapshot.followers],
    followerCount: snapshot.followerCount,
    createdAt: snapshot.createdAt.toISOString(),
  };
}

/**
 * Deserializes a JSON object to a Snapshot.
 * Converts ISO string back to Date object.
 */
export function fromJSON(json: SnapshotJSON): Snapshot {
  return {
    id: json.id,
    userId: json.userId,
    followers: [...json.followers],
    followerCount: json.followerCount,
    createdAt: new Date(json.createdAt),
  };
}

/**
 * Creates a new Snapshot with the given parameters.
 * Automatically sets followerCount based on followers array length.
 */
export function createSnapshot(
  id: string,
  userId: string,
  followers: string[],
  createdAt: Date = new Date()
): Snapshot {
  return {
    id,
    userId,
    followers: [...followers],
    followerCount: followers.length,
    createdAt,
  };
}

export default {
  toJSON,
  fromJSON,
  createSnapshot,
};
