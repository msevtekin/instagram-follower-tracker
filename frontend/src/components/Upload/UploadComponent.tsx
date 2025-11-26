/**
 * UploadComponent
 * 
 * Allows users to upload follower lists via file upload or text paste.
 * Supports drag & drop and file type validation.
 */

import { useState, useRef, DragEvent, ChangeEvent } from 'react';

interface UploadComponentProps {
  onUpload: (content: string, fileName?: string) => void;
  loading?: boolean;
}

const ALLOWED_FILE_TYPES = ['text/plain', 'text/csv', 'application/json'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function UploadComponent({ onUpload, loading = false }: UploadComponentProps) {
  const [textInput, setTextInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type) && !file.name.endsWith('.txt')) {
      return 'Invalid file type. Please upload a .txt, .csv, or .json file.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 5MB.';
    }
    return null;
  };

  const processFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const content = await file.text();
      setError(null);
      onUpload(content, file.name);
    } catch {
      setError('Failed to read file');
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      setError('Please enter some usernames');
      return;
    }
    setError(null);
    onUpload(textInput, 'Manual Input');
    setTextInput('');
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="upload-component">
      <h2>Upload Follower List</h2>
      
      {error && <div className="error-message">{error}</div>}

      {/* Drag & Drop Zone */}
      <div
        className={`drop-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,.json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <p>Drag & drop a file here, or</p>
        <button type="button" onClick={handleButtonClick} disabled={loading}>
          Choose File
        </button>
        <p className="file-hint">Supported: .txt, .csv, .json (max 5MB)</p>
      </div>

      {/* Text Input */}
      <div className="text-input-section">
        <h3>Or paste usernames directly</h3>
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Enter usernames (one per line, or comma-separated)"
          rows={6}
          disabled={loading}
        />
        <button onClick={handleTextSubmit} disabled={loading || !textInput.trim()}>
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
}

export default UploadComponent;
