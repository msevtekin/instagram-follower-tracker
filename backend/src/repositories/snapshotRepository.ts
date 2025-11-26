/**
 * SnapshotRepository
 * 
 * Handles CRUD operations for Snapshot documents in Firestore.
 */

import { db } from '../config/firebase';
import { Snapshot, SnapshotJSON, toJSON, fromJSON, createSnapshot } from '../models/snapshot';

const COLLECTION_NAME = 'snapshots';

export interface SnapshotRepository {
  create(userId: string, followers: string[]): Promise<Snapshot>;
  getById(id: string): Promise<Snapshot | null>;
  getAllByUser(userId: string): Promise<Snapshot[]>;
  delete(id: string): Promise<void>;
  deleteAllByUser(userId: string): Promise<void>;
}

/**
 * Creates a new snapshot and stores it in Firestore.
 * Automatically generates ID and timestamp.
 */
export async function create(userId: string, followers: string[]): Promise<Snapshot> {
  const docRef = db.collection(COLLECTION_NAME).doc();
  const snapshot = createSnapshot(docRef.id, userId, followers, new Date());
  
  await docRef.set(toJSON(snapshot));
  
  return snapshot;
}

/**
 * Retrieves a snapshot by its ID.
 * Returns null if not found.
 */
export async function getById(id: string): Promise<Snapshot | null> {
  const docRef = db.collection(COLLECTION_NAME).doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    return null;
  }
  
  return fromJSON(doc.data() as SnapshotJSON);
}

/**
 * Retrieves all snapshots for a specific user.
 * Returns snapshots sorted by creation date (newest first).
 */
export async function getAllByUser(userId: string): Promise<Snapshot[]> {
  const querySnapshot = await db
    .collection(COLLECTION_NAME)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  
  return querySnapshot.docs.map(doc => fromJSON(doc.data() as SnapshotJSON));
}


/**
 * Deletes a snapshot by its ID.
 */
export async function deleteSnapshot(id: string): Promise<void> {
  await db.collection(COLLECTION_NAME).doc(id).delete();
}

/**
 * Deletes all snapshots for a specific user.
 */
export async function deleteAllByUser(userId: string): Promise<void> {
  const querySnapshot = await db
    .collection(COLLECTION_NAME)
    .where('userId', '==', userId)
    .get();
  
  const batch = db.batch();
  querySnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
}

// Export as an object implementing the interface for dependency injection
export const snapshotRepository: SnapshotRepository = {
  create,
  getById,
  getAllByUser,
  delete: deleteSnapshot,
  deleteAllByUser,
};

export default snapshotRepository;
