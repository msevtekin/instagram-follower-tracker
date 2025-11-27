/**
 * ComparisonComponent
 * 
 * Displays comparison results between two snapshots.
 */

import { useState } from 'react';
import { ComparisonResponse } from '../../services/api';

interface ComparisonComponentProps {
  result: ComparisonResponse;
  onClose: () => void;
}

type SortOption = 'alphabetical' | 'none';

export function ComparisonComponent({ result, onClose }: ComparisonComponentProps) {
  const [sortOption, setSortOption] = useState<SortOption>('alphabetical');
  const [searchNew, setSearchNew] = useState('');
  const [searchUnfollow, setSearchUnfollow] = useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const sortUsernames = (usernames: string[]): string[] => {
    if (sortOption === 'alphabetical') {
      return [...usernames].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    }
    return usernames;
  };

  const filterUsernames = (usernames: string[], search: string): string[] => {
    if (!search.trim()) return usernames;
    return usernames.filter(u => u.toLowerCase().includes(search.toLowerCase()));
  };

  const sortedNewFollowers = sortUsernames(result.newFollowers);
  const sortedUnfollowers = sortUsernames(result.unfollowers);
  
  const filteredNewFollowers = filterUsernames(sortedNewFollowers, searchNew);
  const filteredUnfollowers = filterUsernames(sortedUnfollowers, searchUnfollow);

  const openInstagram = (username: string) => {
    window.open(`https://instagram.com/${username}`, '_blank');
  };

  return (
    <div className="comparison-component">
      <div className="comparison-header">
        <h2>📊 Comparison Results</h2>
        <button className="close-btn" onClick={onClose}>
          ✕ Close
        </button>
      </div>

      {/* Snapshot Info */}
      <div className="snapshot-info-section">
        <div className="snapshot-info-item">
          <strong>📅 Old:</strong>
          <span>{formatDate(result.oldSnapshot.createdAt)}</span>
          <span className="follower-badge">{result.oldSnapshot.followerCount} followers</span>
        </div>
        <div className="snapshot-info-item">
          <strong>📅 New:</strong>
          <span>{formatDate(result.newSnapshot.createdAt)}</span>
          <span className="follower-badge">{result.newSnapshot.followerCount} followers</span>
        </div>
        <div className="snapshot-info-item summary">
          <span className="change-positive">+{result.newFollowersCount} new</span>
          <span className="change-negative">-{result.unfollowersCount} unfollowed</span>
          <span className="change-net">
            Net: {result.newSnapshot.followerCount - result.oldSnapshot.followerCount >= 0 ? '+' : ''}
            {result.newSnapshot.followerCount - result.oldSnapshot.followerCount}
          </span>
        </div>
      </div>

      {/* Sort Options */}
      <div className="sort-options">
        <label>
          Sort:
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
          >
            <option value="alphabetical">A-Z</option>
            <option value="none">Default</option>
          </select>
        </label>
      </div>

      {/* Results */}
      <div className="comparison-results">
        {/* New Followers Section */}
        <div className="result-section new-followers">
          <h3>✅ New Followers <span className="result-count">{result.newFollowersCount}</span></h3>
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search..."
            value={searchNew}
            onChange={(e) => setSearchNew(e.target.value)}
          />
          {filteredNewFollowers.length === 0 ? (
            <p className="empty-message">{searchNew ? 'No matches' : 'No new followers'}</p>
          ) : (
            <ul className="username-list">
              {filteredNewFollowers.map((username) => (
                <li key={username}>
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
          )}
        </div>

        {/* Unfollowers Section */}
        <div className="result-section unfollowers">
          <h3>❌ Unfollowers <span className="result-count">{result.unfollowersCount}</span></h3>
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search..."
            value={searchUnfollow}
            onChange={(e) => setSearchUnfollow(e.target.value)}
          />
          {filteredUnfollowers.length === 0 ? (
            <p className="empty-message">{searchUnfollow ? 'No matches' : 'No unfollowers'}</p>
          ) : (
            <ul className="username-list">
              {filteredUnfollowers.map((username) => (
                <li key={username}>
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
          )}
        </div>
      </div>
    </div>
  );
}

export default ComparisonComponent;
