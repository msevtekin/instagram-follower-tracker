/**
 * Snapshot API Routes
 * 
 * Handles CRUD operations for follower snapshots.
 */

import { Router, Response } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../middleware/auth';
import { snapshotRepository } from '../repositories/snapshotRepository';
import { parse } from '../services/followerParser';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * POST /api/snapshots
 * Create a new snapshot from follower list input.
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { followers } = req.body;
    
    if (!followers || typeof followers !== 'string') {
      res.status(400).json({ error: 'Invalid input format' });
      return;
    }

    const userId = req.user!.uid;
    const parsedFollowers = parse(followers);
    
    if (parsedFollowers.length === 0) {
      res.status(400).json({ error: 'No valid usernames found in input' });
      return;
    }

    const snapshot = await snapshotRepository.create(userId, parsedFollowers);
    
    res.status(201).json({
      id: snapshot.id,
      followerCount: snapshot.followerCount,
      createdAt: snapshot.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating snapshot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/snapshots
 * Get all snapshots for the authenticated user.
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.uid;
    const snapshots = await snapshotRepository.getAllByUser(userId);
    
    res.json(snapshots.map(s => ({
      id: s.id,
      followerCount: s.followerCount,
      createdAt: s.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error('Error fetching snapshots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/snapshots/:id
 * Get a specific snapshot by ID.
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const snapshot = await snapshotRepository.getById(id);
    
    if (!snapshot) {
      res.status(404).json({ error: 'Snapshot not found' });
      return;
    }

    // Verify ownership
    if (snapshot.userId !== req.user!.uid) {
      res.status(404).json({ error: 'Snapshot not found' });
      return;
    }

    res.json({
      id: snapshot.id,
      followers: snapshot.followers,
      followerCount: snapshot.followerCount,
      createdAt: snapshot.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching snapshot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/snapshots/:id
 * Delete a specific snapshot.
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const snapshot = await snapshotRepository.getById(id);
    
    if (!snapshot) {
      res.status(404).json({ error: 'Snapshot not found' });
      return;
    }

    // Verify ownership
    if (snapshot.userId !== req.user!.uid) {
      res.status(404).json({ error: 'Snapshot not found' });
      return;
    }

    await snapshotRepository.delete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting snapshot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/snapshots
 * Delete all snapshots for the authenticated user.
 */
router.delete('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.uid;
    await snapshotRepository.deleteAllByUser(userId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting all snapshots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
