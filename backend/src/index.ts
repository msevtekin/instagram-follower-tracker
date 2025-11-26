import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import snapshotsRouter from './routes/snapshots';
import compareRouter from './routes/compare';

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/snapshots', snapshotsRouter);
app.use('/api/compare', compareRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
