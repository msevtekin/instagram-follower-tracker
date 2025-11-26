/**
 * ComparisonComponent
 * 
 * Displays comparison results between two snapshots.
 */

import { ComparisonResponse } from '../../services/api';

interface ComparisonComponentProps {
  result: ComparisonResponse;
  onClose: () => void;
}

type SortOption = 'alphabetical' | 'none';

import { useState } from 'react';

export function ComparisonComponent({ result, onClose }: ComparisonComponentProps) {
  const [sortOption, setSortOption] = useState<SortOption>('none');

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

  const sortedNewFollowers = sortUsernames(result.newFollowers);
  const sortedUnfollowers = sortUsernames(result.unfollowers);

  return (
    <div className="comparison-component">
      <div className="comparison-header">
        <h2>Comparison Results</h2>
        <button className="close-btn" onClick={onClose}>
          Close
        </button>
      </div>

      {/* Snapshot Info */}
      <div className="snapshot-info-section">
        <div className="snapshot-info-item">
          <strong>Old Snapshot:</strong>
          <span>{formatDate(result.oldSnapshot.createdAt)}</span>
          <span>({result.oldSnapshot.followerCount} followers)</span>
        </div>
        <div className="snapshot-info-item">
          <strong>New Snapshot:</strong>
          <span>{formatDate(result.newSnapshot.createdAt)}</span>
          <span>({result.newSnapshot.followerCount} followers)</span>
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
            <option value="none">Default</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </label>
      </div>

      {/* Results */}
      <div className="comparison-results">
        {/* New Followers Section */}
        <div className="result-section new-followers">
          <h3>New Followers ({result.newFollowersCount})</h3>
          {sortedNewFollowers.length === 0 ? (
            <p className="empty-message">No new followers</p>
          ) : (
            <ul className="username-list">
              {sortedNewFollowers.map((username) => (
                <li key={username}>{username}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Unfollowers Section */}
        <div className="result-section unfollowers">
          <h3>Unfollowers ({result.unfollowersCount})</h3>
          {sortedUnfollowers.length === 0 ? (
            <p className="empty-message">No unfollowers</p>
          ) : (
            <ul className="username-list">
              {sortedUnfollowers.map((username) => (
                <li key={username}>{username}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComparisonComponent;
