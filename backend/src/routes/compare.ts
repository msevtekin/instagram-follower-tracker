/**
 * Comparison API Route
 * 
 * Handles comparison between two follower snapshots.
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import { snapshotRepository } from '../repositories/snapshotRepository';
import { findNewFollowers, findUnfollowers } from '../services/listComparator';
import { ComparisonResult, createComparisonResult } from '../models/comparisonResult';

const router = Router();

// Apply authentication middleware
router.use(authMiddleware);

/**
 * POST /api/compare
 * Compare two snapshots and return the differences.
 * Body: { oldSnapshotId: string, newSnapshotId: string }
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { oldSnapshotId, newSnapshotId } = req.body;

    if (!oldSnapshotId || !newSnapshotId) {
      res.status(400).json({ error: 'Both oldSnapshotId and newSnapshotId are required' });
      return;
    }

    const userId = req.user!.uid;

    // Fetch both snapshots
    const [oldSnapshot, newSnapshot] = await Promise.all([
      snapshotRepository.getById(oldSnapshotId),
      snapshotRepository.getById(newSnapshotId),
    ]);

    // Verify snapshots exist
    if (!oldSnapshot) {
      res.status(404).json({ error: 'Old snapshot not found' });
      return;
    }
    if (!newSnapshot) {
      res.status(404).json({ error: 'New snapshot not found' });
      return;
    }

    // Verify ownership
    if (oldSnapshot.userId !== userId || newSnapshot.userId !== userId) {
      res.status(404).json({ error: 'Snapshot not found' });
      return;
    }


    // Perform comparison
    const newFollowers = findNewFollowers(oldSnapshot.followers, newSnapshot.followers);
    const unfollowers = findUnfollowers(oldSnapshot.followers, newSnapshot.followers);

    const result: ComparisonResult = createComparisonResult(
      newFollowers,
      unfollowers,
      {
        id: oldSnapshot.id,
        createdAt: oldSnapshot.createdAt,
        followerCount: oldSnapshot.followerCount,
      },
      {
        id: newSnapshot.id,
        createdAt: newSnapshot.createdAt,
        followerCount: newSnapshot.followerCount,
      }
    );

    res.json({
      newFollowers: result.newFollowers,
      unfollowers: result.unfollowers,
      newFollowersCount: result.newFollowers.length,
      unfollowersCount: result.unfollowers.length,
      oldSnapshot: {
        id: result.oldSnapshot.id,
        createdAt: result.oldSnapshot.createdAt.toISOString(),
        followerCount: result.oldSnapshot.followerCount,
      },
      newSnapshot: {
        id: result.newSnapshot.id,
        createdAt: result.newSnapshot.createdAt.toISOString(),
        followerCount: result.newSnapshot.followerCount,
      },
    });
  } catch (error) {
    console.error('Error comparing snapshots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
