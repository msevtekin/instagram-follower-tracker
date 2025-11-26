/**
 * HistoryComponent
 * 
 * Displays snapshot history with selection and deletion functionality.
 */

import { useState } from 'react';

interface Snapshot {
  id: string;
  fileName?: string;
  followers?: string[];
  followerCount: number;
  createdAt: string;
}

interface HistoryComponentProps {
  snapshots: Snapshot[];
  selectedSnapshots: string[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onExport: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  loading?: boolean;
}

export function HistoryComponent({
  snapshots,
  selectedSnapshots,
  onSelect,
  onDelete,
  onDeleteAll,
  onExport,
  onRename,
  loading = false,
}: HistoryComponentProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const isSelected = (id: string) => selectedSnapshots.includes(id);

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName || '');
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  if (snapshots.length === 0) {
    return (
      <div className="history-component">
        <h2>Snapshot History</h2>
        <p className="empty-message">No snapshots yet. Upload a follower list to get started.</p>
      </div>
    );
  }

  return (
    <div className="history-component">
      <div className="history-header">
        <h2>Snapshot History</h2>
        <button
          className="delete-all-btn"
          onClick={onDeleteAll}
          disabled={loading || snapshots.length === 0}
        >
          Delete All
        </button>
      </div>

      <p className="selection-hint">
        Select two snapshots to compare (selected: {selectedSnapshots.length}/2)
      </p>


      <ul className="snapshot-list">
        {snapshots.map((snapshot) => (
          <li
            key={snapshot.id}
            className={`snapshot-item ${isSelected(snapshot.id) ? 'selected' : ''}`}
          >
            <div
              className="snapshot-info"
              onClick={() => onSelect(snapshot.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(snapshot.id)}
            >
              {editingId === snapshot.id ? (
                <input
                  type="text"
                  className="edit-filename-input"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <span
                  className="snapshot-filename"
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startEditing(snapshot.id, snapshot.fileName || '');
                  }}
                  title="Double-click to edit"
                >
                  {snapshot.fileName || 'Unknown'}
                </span>
              )}
              <span className="snapshot-date">{formatDate(snapshot.createdAt)}</span>
              <span className="snapshot-count">{snapshot.followerCount} followers</span>
            </div>
            <button
              className="export-btn"
              onClick={(e) => {
                e.stopPropagation();
                onExport(snapshot.id);
              }}
              disabled={loading}
              aria-label="Export snapshot as CSV"
            >
              Export
            </button>
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(snapshot.id);
              }}
              disabled={loading}
              aria-label="Delete snapshot"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HistoryComponent;
