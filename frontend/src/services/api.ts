/**
 * API Service
 * 
 * Handles all API calls to the backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SnapshotResponse {
  id: string;
  followerCount: number;
  createdAt: string;
}

interface SnapshotDetailResponse extends SnapshotResponse {
  followers: string[];
}

interface ComparisonResponse {
  newFollowers: string[];
  unfollowers: string[];
  newFollowersCount: number;
  unfollowersCount: number;
  oldSnapshot: {
    id: string;
    createdAt: string;
    followerCount: number;
  };
  newSnapshot: {
    id: string;
    createdAt: string;
    followerCount: number;
  };
}

async function fetchWithAuth(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response;
}


/**
 * Creates a new snapshot from follower list content.
 */
export async function createSnapshot(
  token: string,
  followers: string
): Promise<SnapshotResponse> {
  const response = await fetchWithAuth('/api/snapshots', token, {
    method: 'POST',
    body: JSON.stringify({ followers }),
  });
  return response.json();
}

/**
 * Gets all snapshots for the authenticated user.
 */
export async function getSnapshots(token: string): Promise<SnapshotResponse[]> {
  const response = await fetchWithAuth('/api/snapshots', token);
  return response.json();
}

/**
 * Gets a specific snapshot by ID.
 */
export async function getSnapshotById(
  token: string,
  id: string
): Promise<SnapshotDetailResponse> {
  const response = await fetchWithAuth(`/api/snapshots/${id}`, token);
  return response.json();
}

/**
 * Deletes a specific snapshot.
 */
export async function deleteSnapshot(token: string, id: string): Promise<void> {
  await fetchWithAuth(`/api/snapshots/${id}`, token, {
    method: 'DELETE',
  });
}

/**
 * Deletes all snapshots for the authenticated user.
 */
export async function deleteAllSnapshots(token: string): Promise<void> {
  await fetchWithAuth('/api/snapshots', token, {
    method: 'DELETE',
  });
}

/**
 * Compares two snapshots and returns the differences.
 */
export async function compareSnapshots(
  token: string,
  oldSnapshotId: string,
  newSnapshotId: string
): Promise<ComparisonResponse> {
  const response = await fetchWithAuth('/api/compare', token, {
    method: 'POST',
    body: JSON.stringify({ oldSnapshotId, newSnapshotId }),
  });
  return response.json();
}

export type { SnapshotResponse, SnapshotDetailResponse, ComparisonResponse };
