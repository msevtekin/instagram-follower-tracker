/**
 * SnapshotDetail Component
 * 
 * Displays detailed view of a snapshot with search functionality.
 */

import { useState } from 'react';

interface Snapshot {
  id: string;
  fileName?: string;
  followers: string[];
  followerCount: number;
  createdAt: string;
}

interface SnapshotDetailProps {
  snapshot: Snapshot;
  onClose: () => void;
}

export function SnapshotDetail({ snapshot, onClose }: SnapshotDetailProps) {
  const [search, setSearch] = useState('');
  const [sortAZ, setSortAZ] = useState(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const openInstagram = (username: string) => {
    window.open(`https://instagram.com/${username}`, '_blank');
  };

  let displayedFollowers = [...snapshot.followers];
  
  // Sort
  if (sortAZ) {
    displayedFollowers.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }
  
  // Filter
  if (search.trim()) {
    displayedFollowers = displayedFollowers.filter(u => 
      u.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <div className="snapshot-detail">
      <div className="detail-header">
        <div>
          <h2>📋 {snapshot.fileName || 'Snapshot'}</h2>
          <p className="detail-meta">
            {formatDate(snapshot.createdAt)} • {snapshot.followerCount} followers
          </p>
        </div>
        <button className="close-btn" onClick={onClose}>✕ Close</button>
      </div>

      <div className="detail-controls">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search followers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button 
          className={`sort-btn ${sortAZ ? 'active' : ''}`}
          onClick={() => setSortAZ(!sortAZ)}
        >
          {sortAZ ? '🔤 A-Z' : '📅 Original'}
        </button>
      </div>

      <div className="detail-stats">
        <span>Showing {displayedFollowers.length} of {snapshot.followerCount}</span>
      </div>

      <ul className="follower-list">
        {displayedFollowers.map((username, index) => (
          <li key={username}>
            <span className="follower-index">{index + 1}</span>
            <button 
              className="username-link"
              onClick={() => openInstagram(username)}
              title="Open Instagram profile"
            >
              @{username}
            </button>
          </li>
        ))}
      </ul>

      {displayedFollowers.length === 0 && (
        <p className="empty-message">No followers match your search</p>
      )}
    </div>
  );
}

export default SnapshotDetail;
