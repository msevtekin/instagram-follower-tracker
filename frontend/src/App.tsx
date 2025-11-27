/**
 * Main App Component
 * 
 * Root component with main layout (no authentication).
 */

import { useState, useEffect, useCallback } from 'react';
import { UploadComponent, InstagramScript } from './components/Upload';
import { HistoryComponent, SnapshotDetail } from './components/History';
import { ComparisonComponent } from './components/Comparison';
import './index.css';

type View = 'upload' | 'history';

// Local storage key for snapshots
const STORAGE_KEY = 'follower_snapshots';

interface Snapshot {
  id: string;
  fileName: string;
  followers: string[];
  followerCount: number;
  createdAt: string;
}

interface ComparisonResult {
  newFollowers: string[];
  unfollowers: string[];
  newFollowersCount: number;
  unfollowersCount: number;
  oldSnapshot: { id: string; createdAt: string; followerCount: number };
  newSnapshot: { id: string; createdAt: string; followerCount: number };
}

function App() {
  const [view, setView] = useState<View>('upload');
  // Initialize snapshots from localStorage
  const [snapshots, setSnapshots] = useState<Snapshot[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Loaded snapshots from localStorage:', parsed.length);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load snapshots from localStorage:', e);
    }
    return [];
  });
  const [selectedSnapshots, setSelectedSnapshots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUploadCount, setLastUploadCount] = useState<number | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [viewingSnapshot, setViewingSnapshot] = useState<Snapshot | null>(null);

  // Save snapshots to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
      console.log('Saved snapshots to localStorage:', snapshots.length);
    } catch (e) {
      console.error('Failed to save snapshots to localStorage:', e);
    }
  }, [snapshots]);


  // Validate Instagram username
  const isValidUsername = (username: string): boolean => {
    if (!username || username.length < 1 || username.length > 30) return false;
    const validPattern = /^[a-zA-Z0-9_.]+$/;
    if (!validPattern.test(username)) return false;
    if (username.startsWith('.') || username.endsWith('.')) return false;
    if (username.includes('..')) return false;
    return true;
  };

  // Parse a CSV line handling quoted values
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  // Parse follower list (supports CSV with Username column)
  const parseFollowers = (input: string): string[] => {
    const lines = input.split(/\r?\n/);
    const firstLine = lines[0] || '';
    
    // Check if CSV format with Username column
    if (firstLine.toLowerCase().includes('username') && firstLine.includes(',')) {
      const headers = parseCSVLine(firstLine);
      const usernameIndex = headers.findIndex(h => h.toLowerCase().trim() === 'username');
      
      if (usernameIndex !== -1) {
        const validUsernames: string[] = [];
        const seen = new Set<string>();
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const columns = parseCSVLine(line);
          if (columns.length > usernameIndex) {
            const username = columns[usernameIndex].trim();
            if (isValidUsername(username)) {
              const lowerCase = username.toLowerCase();
              if (!seen.has(lowerCase)) {
                seen.add(lowerCase);
                validUsernames.push(username);
              }
            }
          }
        }
        return validUsernames;
      }
    }
    
    // Fallback: plain text parsing
    const separatorPattern = /[\n\r,\t]+|\s{2,}/;
    const entries = input.split(separatorPattern);
    const validUsernames: string[] = [];
    const seen = new Set<string>();

    for (const entry of entries) {
      const trimmed = entry.trim();
      if (!trimmed) continue;
      
      if (isValidUsername(trimmed)) {
        const lowerCase = trimmed.toLowerCase();
        if (!seen.has(lowerCase)) {
          seen.add(lowerCase);
          validUsernames.push(trimmed);
        }
      }
    }
    return validUsernames;
  };

  const uploadFollowers = useCallback((content: string, fileName?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const followers = parseFollowers(content);
      if (followers.length === 0) {
        setError('No valid usernames found in input');
        return;
      }

      const newSnapshot: Snapshot = {
        id: Date.now().toString(),
        fileName: fileName || 'Manual Input',
        followers,
        followerCount: followers.length,
        createdAt: new Date().toISOString(),
      };

      setSnapshots(prev => [newSnapshot, ...prev]);
      setLastUploadCount(followers.length);
      
      // Clear success message after 3 seconds
      setTimeout(() => setLastUploadCount(null), 3000);
    } catch {
      setError('Failed to parse follower list');
    } finally {
      setLoading(false);
    }
  }, []);

  const removeSnapshot = useCallback((id: string) => {
    setSnapshots(prev => prev.filter(s => s.id !== id));
    setSelectedSnapshots(prev => prev.filter(s => s !== id));
  }, []);

  const removeAllSnapshots = useCallback(() => {
    setSnapshots([]);
    setSelectedSnapshots([]);
  }, []);

  const exportSnapshot = useCallback((id: string) => {
    const snapshot = snapshots.find(s => s.id === id);
    if (!snapshot || !snapshot.followers) return;

    // Create CSV content with Username header
    const csvContent = 'Username\n' + snapshot.followers.join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Generate filename from snapshot info
    const date = new Date(snapshot.createdAt).toISOString().split('T')[0];
    const baseName = snapshot.fileName?.replace(/\.[^/.]+$/, '') || 'snapshot';
    link.download = `${baseName}_${date}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [snapshots]);

  const renameSnapshot = useCallback((id: string, newName: string) => {
    setSnapshots(prev => prev.map(s => 
      s.id === id ? { ...s, fileName: newName } : s
    ));
  }, []);

  const handleSelect = (id: string) => {
    setSelectedSnapshots(prev => {
      if (prev.includes(id)) {
        return prev.filter(s => s !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleCompare = () => {
    if (selectedSnapshots.length !== 2) return;

    const oldSnapshot = snapshots.find(s => s.id === selectedSnapshots[0]);
    const newSnapshot = snapshots.find(s => s.id === selectedSnapshots[1]);

    if (!oldSnapshot || !newSnapshot) return;

    const oldSet = new Set(oldSnapshot.followers.map(u => u.toLowerCase()));
    const newSet = new Set(newSnapshot.followers.map(u => u.toLowerCase()));

    const newFollowers = newSnapshot.followers.filter(u => !oldSet.has(u.toLowerCase()));
    const unfollowers = oldSnapshot.followers.filter(u => !newSet.has(u.toLowerCase()));

    setComparisonResult({
      newFollowers,
      unfollowers,
      newFollowersCount: newFollowers.length,
      unfollowersCount: unfollowers.length,
      oldSnapshot: {
        id: oldSnapshot.id,
        createdAt: oldSnapshot.createdAt,
        followerCount: oldSnapshot.followerCount,
      },
      newSnapshot: {
        id: newSnapshot.id,
        createdAt: newSnapshot.createdAt,
        followerCount: newSnapshot.followerCount,
      },
    });
  };

  const clearError = () => setError(null);
  const clearComparison = () => setComparisonResult(null);

  const viewSnapshot = useCallback((id: string) => {
    const snapshot = snapshots.find(s => s.id === id);
    if (snapshot) {
      setViewingSnapshot(snapshot);
    }
  }, [snapshots]);

  const closeSnapshotView = () => setViewingSnapshot(null);


  return (
    <div className="dashboard">
      {/* Header */}
      <header className="app-header">
        <h1>Instagram Follower Tracker</h1>
      </header>

      {/* Navigation */}
      <nav className="app-nav">
        <button
          className={view === 'upload' ? 'active' : ''}
          onClick={() => setView('upload')}
        >
          Upload
        </button>
        <button
          className={view === 'history' ? 'active' : ''}
          onClick={() => setView('history')}
        >
          History ({snapshots.length})
        </button>
        {selectedSnapshots.length === 2 && (
          <button className="compare-btn" onClick={handleCompare} disabled={loading}>
            Compare Selected
          </button>
        )}
      </nav>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}

      {/* Success Message */}
      {lastUploadCount !== null && (
        <div className="success-banner">
          Successfully uploaded {lastUploadCount} followers!
        </div>
      )}

      {/* Main Content */}
      <main className="app-main">
        {view === 'upload' && (
          <>
            <InstagramScript />
            <UploadComponent onUpload={uploadFollowers} loading={loading} />
          </>
        )}
        {view === 'history' && (
          <HistoryComponent
            snapshots={snapshots}
            selectedSnapshots={selectedSnapshots}
            onSelect={handleSelect}
            onDelete={removeSnapshot}
            onDeleteAll={removeAllSnapshots}
            onExport={exportSnapshot}
            onRename={renameSnapshot}
            onView={viewSnapshot}
            loading={loading}
          />
        )}
      </main>

      {/* Comparison Modal */}
      {comparisonResult && (
        <div className="modal-overlay">
          <ComparisonComponent result={comparisonResult} onClose={clearComparison} />
        </div>
      )}

      {/* Snapshot Detail Modal */}
      {viewingSnapshot && (
        <div className="modal-overlay">
          <SnapshotDetail snapshot={viewingSnapshot} onClose={closeSnapshotView} />
        </div>
      )}
    </div>
  );
}

export default App;
